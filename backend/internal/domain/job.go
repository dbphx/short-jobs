package domain

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type JobStatus string

const (
	JobStatusOpen      JobStatus = "open"
	JobStatusAssigned  JobStatus = "assigned"
	JobStatusDone      JobStatus = "done"
	JobStatusCancelled JobStatus = "cancelled"
)

type Job struct {
	ID               uuid.UUID  `gorm:"type:uuid;primaryKey" json:"id"`
	EmployerID       uuid.UUID  `gorm:"type:uuid;not null;index" json:"employer_id"`
	Employer         *User      `gorm:"foreignKey:EmployerID" json:"employer,omitempty"`
	Title            string     `gorm:"type:varchar(255);not null" json:"title"`
	Description      string     `gorm:"type:text" json:"description"`
	HourlyRate       float64    `gorm:"type:double precision" json:"hourly_rate"`
	TotalPayment     float64    `gorm:"type:double precision" json:"total_payment"`
	Latitude         float64    `gorm:"type:double precision;not null" json:"latitude"`
	Longitude        float64    `gorm:"type:double precision;not null" json:"longitude"`
	Status           JobStatus  `gorm:"type:varchar(20);not null;default:'open'" json:"status"`
	AssignedWorkerID *uuid.UUID `gorm:"type:uuid" json:"assigned_worker_id,omitempty"`
	AssignedWorker   *User      `gorm:"foreignKey:AssignedWorkerID" json:"assigned_worker,omitempty"`
	EmployerRated    bool       `gorm:"-" json:"employer_rated"`
	WorkerRated      bool       `gorm:"-" json:"worker_rated"`
	CreatedAt        time.Time  `gorm:"autoCreateTime" json:"created_at"`
}

// JobWithDistance is used for nearby queries
type JobWithDistance struct {
	Job
	Distance float64 `json:"distance"`
}

func (j *Job) BeforeCreate(tx *gorm.DB) error {
	if j.ID == uuid.Nil {
		j.ID = uuid.New()
	}
	return nil
}
