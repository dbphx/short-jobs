package repository

import (
	"github.com/google/uuid"
	"github.com/work-near-me/backend/internal/domain"
	"gorm.io/gorm"
)

type JobRepository struct {
	db *gorm.DB
}

func NewJobRepository(db *gorm.DB) *JobRepository {
	return &JobRepository{db: db}
}

func (r *JobRepository) Create(job *domain.Job) error {
	return r.db.Create(job).Error
}

func (r *JobRepository) FindByID(id uuid.UUID) (*domain.Job, error) {
	var job domain.Job
	err := r.db.Preload("Employer").Where("id = ?", id).First(&job).Error
	if err != nil {
		return nil, err
	}
	return &job, nil
}

func (r *JobRepository) FindNearby(lat, lng, radiusKM float64) ([]domain.JobWithDistance, error) {
	var jobs []domain.JobWithDistance

	query := `
		SELECT * FROM (
			SELECT *, (
				6371 * acos(
					LEAST(1.0, GREATEST(-1.0,
						cos(radians(?)) *
						cos(radians(latitude)) *
						cos(radians(longitude) - radians(?)) +
						sin(radians(?)) *
						sin(radians(latitude))
					))
				)
			) AS distance
			FROM jobs
			WHERE status = 'open'
		) AS nearby
		WHERE distance < ?
		ORDER BY distance
	`

	err := r.db.Raw(query, lat, lng, lat, radiusKM).Scan(&jobs).Error
	if err != nil {
		return nil, err
	}
	return jobs, nil
}

func (r *JobRepository) FindByEmployerID(employerID uuid.UUID) ([]domain.Job, error) {
	var jobs []domain.Job
	err := r.db.Where("employer_id = ?", employerID).
		Order("created_at DESC").
		Find(&jobs).Error
	if err != nil {
		return nil, err
	}
	return jobs, nil
}

func (r *JobRepository) FindByWorkerID(workerID uuid.UUID) ([]domain.Job, error) {
	var jobs []domain.Job
	err := r.db.Preload("Employer").
		Where("assigned_worker_id = ?", workerID).
		Order("created_at DESC").
		Find(&jobs).Error
	return jobs, err
}

func (r *JobRepository) Update(job *domain.Job) error {
	return r.db.Save(job).Error
}
