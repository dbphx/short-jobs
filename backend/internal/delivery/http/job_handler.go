package http

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/work-near-me/backend/internal/usecase"
)

type JobHandler struct {
	jobUC *usecase.JobUseCase
}

func NewJobHandler(jobUC *usecase.JobUseCase) *JobHandler {
	return &JobHandler{jobUC: jobUC}
}

func (h *JobHandler) Create(c *gin.Context) {
	var input usecase.CreateJobInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID := c.MustGet("user_id").(uuid.UUID)

	job, err := h.jobUC.Create(userID, input)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, job)
}

func (h *JobHandler) GetNearby(c *gin.Context) {
	var query usecase.NearbyQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	jobs, err := h.jobUC.GetNearby(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"jobs": jobs})
}

func (h *JobHandler) GetByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid job id"})
		return
	}

	job, err := h.jobUC.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "job not found"})
		return
	}

	c.JSON(http.StatusOK, job)
}

func (h *JobHandler) Assign(c *gin.Context) {
	jobID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid job id"})
		return
	}

	var input struct {
		WorkerID uuid.UUID `json:"worker_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	employerID := c.MustGet("user_id").(uuid.UUID)

	job, err := h.jobUC.Assign(jobID, input.WorkerID, employerID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, job)
}

func (h *JobHandler) Complete(c *gin.Context) {
	jobID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid job id"})
		return
	}

	userID := c.MustGet("user_id").(uuid.UUID)

	job, err := h.jobUC.Complete(jobID, userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, job)
}

func (h *JobHandler) GetMyJobs(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)

	jobs, err := h.jobUC.GetByEmployerID(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"jobs": jobs})
}

func (h *JobHandler) GetAssignments(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)

	jobs, err := h.jobUC.GetByWorkerID(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"jobs": jobs})
}
