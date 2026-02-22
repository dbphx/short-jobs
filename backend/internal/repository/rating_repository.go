package repository

import (
	"github.com/google/uuid"
	"github.com/work-near-me/backend/internal/domain"
	"gorm.io/gorm"
)

type RatingRepository struct {
	db *gorm.DB
}

func NewRatingRepository(db *gorm.DB) *RatingRepository {
	return &RatingRepository{db: db}
}

func (r *RatingRepository) Create(rating *domain.Rating) error {
	return r.db.Create(rating).Error
}

func (r *RatingRepository) FindByJobID(jobID uuid.UUID) ([]domain.Rating, error) {
	var ratings []domain.Rating
	err := r.db.Preload("FromUser").Preload("ToUser").
		Where("job_id = ?", jobID).
		Find(&ratings).Error
	if err != nil {
		return nil, err
	}
	return ratings, nil
}

func (r *RatingRepository) GetUserRatingStats(userID uuid.UUID) (float64, int, error) {
	var result struct {
		Avg   float64
		Count int
	}

	err := r.db.Model(&domain.Rating{}).
		Select("COALESCE(AVG(score), 0) as avg, COUNT(*) as count").
		Where("to_user_id = ?", userID).
		Scan(&result).Error

	return result.Avg, result.Count, err
}

func (r *RatingRepository) Exists(jobID, fromUserID uuid.UUID) (bool, error) {
	var count int64
	err := r.db.Model(&domain.Rating{}).
		Where("job_id = ? AND from_user_id = ?", jobID, fromUserID).
		Count(&count).Error
	return count > 0, err
}
