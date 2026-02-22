package http

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/work-near-me/backend/internal/usecase"
)

type RatingHandler struct {
	ratingUC *usecase.RatingUseCase
}

func NewRatingHandler(ratingUC *usecase.RatingUseCase) *RatingHandler {
	return &RatingHandler{ratingUC: ratingUC}
}

func (h *RatingHandler) Create(c *gin.Context) {
	var input usecase.CreateRatingInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	fromUserID := c.MustGet("user_id").(uuid.UUID)

	rating, err := h.ratingUC.Create(fromUserID, input)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, rating)
}
