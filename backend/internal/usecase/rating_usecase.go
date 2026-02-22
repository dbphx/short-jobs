package usecase

import (
	"errors"

	"github.com/google/uuid"
	"github.com/work-near-me/backend/internal/domain"
	"github.com/work-near-me/backend/internal/repository"
)

type RatingUseCase struct {
	ratingRepo *repository.RatingRepository
	userRepo   *repository.UserRepository
	jobRepo    *repository.JobRepository
}

func NewRatingUseCase(
	ratingRepo *repository.RatingRepository,
	userRepo *repository.UserRepository,
	jobRepo *repository.JobRepository,
) *RatingUseCase {
	return &RatingUseCase{
		ratingRepo: ratingRepo,
		userRepo:   userRepo,
		jobRepo:    jobRepo,
	}
}

type CreateRatingInput struct {
	JobID    uuid.UUID `json:"job_id" binding:"required"`
	ToUserID uuid.UUID `json:"to_user_id" binding:"required"`
	Score    int       `json:"score" binding:"required,min=1,max=5"`
	Comment  string    `json:"comment"`
}

func (uc *RatingUseCase) Create(fromUserID uuid.UUID, input CreateRatingInput) (*domain.Rating, error) {
	// Verify job is done
	job, err := uc.jobRepo.FindByID(input.JobID)
	if err != nil {
		return nil, errors.New("job not found")
	}

	if job.Status != domain.JobStatusDone {
		return nil, errors.New("can only rate after job is completed")
	}

	// Verify the rater is either the employer or assigned worker
	if job.EmployerID != fromUserID && (job.AssignedWorkerID == nil || *job.AssignedWorkerID != fromUserID) {
		return nil, errors.New("only participants can rate")
	}

	// Verify the target is the other participant
	if input.ToUserID != job.EmployerID && (job.AssignedWorkerID == nil || input.ToUserID != *job.AssignedWorkerID) {
		return nil, errors.New("can only rate the other participant")
	}

	// Check if already rated
	exists, err := uc.ratingRepo.Exists(input.JobID, fromUserID)
	if err != nil {
		return nil, errors.New("failed to check existing rating")
	}
	if exists {
		return nil, errors.New("you have already rated for this job")
	}

	rating := &domain.Rating{
		JobID:      input.JobID,
		FromUserID: fromUserID,
		ToUserID:   input.ToUserID,
		Score:      input.Score,
		Comment:    input.Comment,
	}

	if err := uc.ratingRepo.Create(rating); err != nil {
		return nil, errors.New("failed to create rating")
	}

	// Update target user's average rating
	avg, count, err := uc.ratingRepo.GetUserRatingStats(input.ToUserID)
	if err == nil {
		_ = uc.userRepo.UpdateRating(input.ToUserID, avg, count)
	}

	return rating, nil
}
