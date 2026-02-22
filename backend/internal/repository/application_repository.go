package repository

import (
	"github.com/google/uuid"
	"github.com/work-near-me/backend/internal/domain"
	"gorm.io/gorm"
)

type ApplicationRepository struct {
	db *gorm.DB
}

func NewApplicationRepository(db *gorm.DB) *ApplicationRepository {
	return &ApplicationRepository{db: db}
}

func (r *ApplicationRepository) Create(app *domain.Application) error {
	return r.db.Create(app).Error
}

func (r *ApplicationRepository) FindByID(id uuid.UUID) (*domain.Application, error) {
	var app domain.Application
	err := r.db.Preload("Worker").Preload("Job").Where("id = ?", id).First(&app).Error
	if err != nil {
		return nil, err
	}
	return &app, nil
}

func (r *ApplicationRepository) FindByJobID(jobID uuid.UUID) ([]domain.Application, error) {
	var apps []domain.Application
	err := r.db.Preload("Worker").Where("job_id = ?", jobID).
		Order("created_at DESC").
		Find(&apps).Error
	if err != nil {
		return nil, err
	}
	return apps, nil
}

func (r *ApplicationRepository) FindByWorkerAndJob(workerID, jobID uuid.UUID) (*domain.Application, error) {
	var app domain.Application
	err := r.db.Where("worker_id = ? AND job_id = ?", workerID, jobID).First(&app).Error
	if err != nil {
		return nil, err
	}
	return &app, nil
}

func (r *ApplicationRepository) Update(app *domain.Application) error {
	return r.db.Save(app).Error
}
