package usecase

import (
	"errors"

	"github.com/google/uuid"
	"github.com/work-near-me/backend/internal/domain"
	"github.com/work-near-me/backend/internal/repository"
)

type ApplicationUseCase struct {
	appRepo *repository.ApplicationRepository
	jobRepo *repository.JobRepository
}

func NewApplicationUseCase(appRepo *repository.ApplicationRepository, jobRepo *repository.JobRepository) *ApplicationUseCase {
	return &ApplicationUseCase{appRepo: appRepo, jobRepo: jobRepo}
}

func (uc *ApplicationUseCase) Apply(jobID, workerID uuid.UUID) (*domain.Application, error) {
	// Check job exists and is open
	job, err := uc.jobRepo.FindByID(jobID)
	if err != nil {
		return nil, errors.New("job not found")
	}

	if job.Status != domain.JobStatusOpen {
		return nil, errors.New("job is not accepting applications")
	}

	// Check if already applied
	existing, _ := uc.appRepo.FindByWorkerAndJob(workerID, jobID)
	if existing != nil {
		return nil, errors.New("you have already applied for this job")
	}

	app := &domain.Application{
		JobID:    jobID,
		WorkerID: workerID,
		Status:   domain.ApplicationStatusPending,
	}

	if err := uc.appRepo.Create(app); err != nil {
		return nil, errors.New("failed to submit application")
	}

	return app, nil
}

func (uc *ApplicationUseCase) Accept(appID, employerID uuid.UUID) (*domain.Application, error) {
	app, err := uc.appRepo.FindByID(appID)
	if err != nil {
		return nil, errors.New("application not found")
	}

	// Verify employer owns the job
	if app.Job.EmployerID != employerID {
		return nil, errors.New("only the job employer can accept applications")
	}

	if app.Status != domain.ApplicationStatusPending {
		return nil, errors.New("application is not pending")
	}

	app.Status = domain.ApplicationStatusAccepted
	if err := uc.appRepo.Update(app); err != nil {
		return nil, errors.New("failed to accept application")
	}

	// Also assign the worker to the job
	job := app.Job
	job.Status = domain.JobStatusAssigned
	job.AssignedWorkerID = &app.WorkerID
	if err := uc.jobRepo.Update(job); err != nil {
		return nil, errors.New("failed to assign worker to job")
	}

	return app, nil
}

func (uc *ApplicationUseCase) Reject(appID, employerID uuid.UUID) (*domain.Application, error) {
	app, err := uc.appRepo.FindByID(appID)
	if err != nil {
		return nil, errors.New("application not found")
	}

	if app.Job.EmployerID != employerID {
		return nil, errors.New("only the job employer can reject applications")
	}

	if app.Status != domain.ApplicationStatusPending {
		return nil, errors.New("application is not pending")
	}

	app.Status = domain.ApplicationStatusRejected
	if err := uc.appRepo.Update(app); err != nil {
		return nil, errors.New("failed to reject application")
	}

	return app, nil
}

func (uc *ApplicationUseCase) GetByJobID(jobID uuid.UUID) ([]domain.Application, error) {
	return uc.appRepo.FindByJobID(jobID)
}
