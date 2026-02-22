package usecase

import (
	"errors"

	"github.com/google/uuid"
	"github.com/work-near-me/backend/config"
	"github.com/work-near-me/backend/internal/domain"
	"github.com/work-near-me/backend/internal/repository"
	"github.com/work-near-me/backend/pkg"
)

type AuthUseCase struct {
	userRepo *repository.UserRepository
	cfg      *config.Config
}

func NewAuthUseCase(userRepo *repository.UserRepository, cfg *config.Config) *AuthUseCase {
	return &AuthUseCase{userRepo: userRepo, cfg: cfg}
}

type RegisterInput struct {
	Name     string          `json:"name" binding:"required"`
	Phone    string          `json:"phone" binding:"required"`
	Password string          `json:"password" binding:"required,min=6"`
	Role     domain.UserRole `json:"role" binding:"required,oneof=employer worker"`
}

type LoginInput struct {
	Phone    string `json:"phone" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type RefreshInput struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

type AuthResponse struct {
	AccessToken  string       `json:"access_token"`
	RefreshToken string       `json:"refresh_token"`
	User         *domain.User `json:"user"`
}

func (uc *AuthUseCase) Register(input RegisterInput) (*AuthResponse, error) {
	// Check if phone already exists
	existing, _ := uc.userRepo.FindByPhone(input.Phone)
	if existing != nil {
		return nil, errors.New("phone number already registered")
	}

	// Hash password
	hash, err := pkg.HashPassword(input.Password)
	if err != nil {
		return nil, errors.New("failed to hash password")
	}

	user := &domain.User{
		Name:         input.Name,
		Phone:        input.Phone,
		PasswordHash: hash,
		Role:         input.Role,
	}

	if err := uc.userRepo.Create(user); err != nil {
		return nil, errors.New("failed to create user")
	}

	return uc.generateTokens(user)
}

func (uc *AuthUseCase) Login(input LoginInput) (*AuthResponse, error) {
	user, err := uc.userRepo.FindByPhone(input.Phone)
	if err != nil {
		return nil, errors.New("invalid phone or password")
	}

	if !pkg.CheckPassword(input.Password, user.PasswordHash) {
		return nil, errors.New("invalid phone or password")
	}

	return uc.generateTokens(user)
}

func (uc *AuthUseCase) Refresh(input RefreshInput) (*AuthResponse, error) {
	userID, err := pkg.ValidateRefreshToken(input.RefreshToken, uc.cfg.JWT.Secret)
	if err != nil {
		return nil, errors.New("invalid refresh token")
	}

	user, err := uc.userRepo.FindByID(userID)
	if err != nil {
		return nil, errors.New("user not found")
	}

	return uc.generateTokens(user)
}

func (uc *AuthUseCase) generateTokens(user *domain.User) (*AuthResponse, error) {
	accessToken, err := pkg.GenerateAccessToken(
		user.ID, string(user.Role), uc.cfg.JWT.Secret, uc.cfg.JWT.AccessExpiry,
	)
	if err != nil {
		return nil, errors.New("failed to generate access token")
	}

	refreshToken, err := pkg.GenerateRefreshToken(
		user.ID, uc.cfg.JWT.Secret, uc.cfg.JWT.RefreshExpiry,
	)
	if err != nil {
		return nil, errors.New("failed to generate refresh token")
	}

	return &AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User:         user,
	}, nil
}

func (uc *AuthUseCase) GetUserByID(id uuid.UUID) (*domain.User, error) {
	return uc.userRepo.FindByID(id)
}
