package usecase

import (
	"errors"

	"github.com/google/uuid"
	"github.com/work-near-me/backend/config"
	"github.com/work-near-me/backend/internal/domain"
	"github.com/work-near-me/backend/internal/repository"
)

type JobUseCase struct {
	jobRepo    *repository.JobRepository
	ratingRepo *repository.RatingRepository
	cfg        *config.Config
}

func NewJobUseCase(
	jobRepo *repository.JobRepository,
	ratingRepo *repository.RatingRepository,
	cfg *config.Config,
) *JobUseCase {
	return &JobUseCase{
		jobRepo:    jobRepo,
		ratingRepo: ratingRepo,
		cfg:        cfg,
	}
}

type CreateJobInput struct {
	Title        string  `json:"title" binding:"required"`
	Description  string  `json:"description"`
	HourlyRate   float64 `json:"hourly_rate" binding:"required,gt=0"`
	TotalPayment float64 `json:"total_payment"`
	Latitude     float64 `json:"latitude" binding:"required"`
	Longitude    float64 `json:"longitude" binding:"required"`
}

type NearbyQuery struct {
	Latitude  float64 `form:"lat" binding:"required"`
	Longitude float64 `form:"lng" binding:"required"`
	RadiusKM  float64 `form:"radius"`
}

func (uc *JobUseCase) Create(employerID uuid.UUID, input CreateJobInput) (*domain.Job, error) {
	job := &domain.Job{
		EmployerID:   employerID,
		Title:        input.Title,
		Description:  input.Description,
		HourlyRate:   input.HourlyRate,
		TotalPayment: input.TotalPayment,
		Latitude:     input.Latitude,
		Longitude:    input.Longitude,
		Status:       domain.JobStatusOpen,
	}

	if err := uc.jobRepo.Create(job); err != nil {
		return nil, errors.New("failed to create job")
	}

	return job, nil
}

func (uc *JobUseCase) GetNearby(query NearbyQuery) ([]domain.JobWithDistance, error) {
	radius := query.RadiusKM
	if radius <= 0 {
		radius = 3 // default 3km
	}
	if radius > uc.cfg.App.MaxSearchRadiusKM {
		radius = uc.cfg.App.MaxSearchRadiusKM
	}

	return uc.jobRepo.FindNearby(query.Latitude, query.Longitude, radius)
}

func (uc *JobUseCase) GetByID(id uuid.UUID) (*domain.Job, error) {
	job, err := uc.jobRepo.FindByID(id)
	if err != nil {
		return nil, err
	}

	uc.populateRatingStatus(job)
	return job, nil
}

func (uc *JobUseCase) GetByEmployerID(employerID uuid.UUID) ([]domain.Job, error) {
	jobs, err := uc.jobRepo.FindByEmployerID(employerID)
	if err != nil {
		return nil, err
	}
	for i := range jobs {
		uc.populateRatingStatus(&jobs[i])
	}
	return jobs, nil
}

func (uc *JobUseCase) GetByWorkerID(workerID uuid.UUID) ([]domain.Job, error) {
	jobs, err := uc.jobRepo.FindByWorkerID(workerID)
	if err != nil {
		return nil, err
	}
	for i := range jobs {
		uc.populateRatingStatus(&jobs[i])
	}
	return jobs, nil
}

func (uc *JobUseCase) populateRatingStatus(job *domain.Job) {
	if job.Status != domain.JobStatusDone {
		return
	}
	// Check employer rating
	rated, _ := uc.ratingRepo.Exists(job.ID, job.EmployerID)
	job.EmployerRated = rated

	// Check worker rating
	if job.AssignedWorkerID != nil {
		rated, _ = uc.ratingRepo.Exists(job.ID, *job.AssignedWorkerID)
		job.WorkerRated = rated
	}
}

func (uc *JobUseCase) Assign(jobID, workerID uuid.UUID, employerID uuid.UUID) (*domain.Job, error) {
	job, err := uc.jobRepo.FindByID(jobID)
	if err != nil {
		return nil, errors.New("job not found")
	}

	if job.EmployerID != employerID {
		return nil, errors.New("only the employer can assign workers")
	}

	if job.Status != domain.JobStatusOpen {
		return nil, errors.New("job is not open for assignment")
	}

	job.Status = domain.JobStatusAssigned
	job.AssignedWorkerID = &workerID

	if err := uc.jobRepo.Update(job); err != nil {
		return nil, errors.New("failed to assign worker")
	}

	return job, nil
}

func (uc *JobUseCase) Complete(jobID, userID uuid.UUID) (*domain.Job, error) {
	job, err := uc.jobRepo.FindByID(jobID)
	if err != nil {
		return nil, errors.New("job not found")
	}

	if job.EmployerID != userID {
		return nil, errors.New("only the employer can complete the job")
	}

	if job.Status != domain.JobStatusAssigned {
		return nil, errors.New("job must be assigned before completing")
	}

	job.Status = domain.JobStatusDone

	if err := uc.jobRepo.Update(job); err != nil {
		return nil, errors.New("failed to complete job")
	}

	return job, nil
}
