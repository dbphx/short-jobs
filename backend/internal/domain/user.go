package domain

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UserRole string

const (
	RoleEmployer UserRole = "employer"
	RoleWorker   UserRole = "worker"
)

type User struct {
	ID           uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	Name         string    `gorm:"type:varchar(255);not null" json:"name"`
	Phone        string    `gorm:"type:varchar(20);uniqueIndex;not null" json:"phone"`
	PasswordHash string    `gorm:"type:varchar(255);not null" json:"-"`
	Role         UserRole  `gorm:"type:varchar(20);not null" json:"role"`
	Latitude     float64   `gorm:"type:double precision" json:"latitude"`
	Longitude    float64   `gorm:"type:double precision" json:"longitude"`
	RatingAvg    float64   `gorm:"type:double precision;default:0" json:"rating_avg"`
	RatingCount  int       `gorm:"default:0" json:"rating_count"`
	CreatedAt    time.Time `gorm:"autoCreateTime" json:"created_at"`
}

func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return nil
}
