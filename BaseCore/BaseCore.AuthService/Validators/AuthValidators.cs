using BaseCore.AuthService.Controllers;
using FluentValidation;

namespace BaseCore.AuthService.Validators
{
    public class LoginRequestValidator : AbstractValidator<LoginRequest>
    {
        public LoginRequestValidator()
        {
            RuleFor(x => x.Username).NotEmpty().MaximumLength(50);
            RuleFor(x => x.Password).NotEmpty().MaximumLength(255);
        }
    }

    public class RegisterRequestValidator : AbstractValidator<RegisterRequest>
    {
        public RegisterRequestValidator()
        {
            RuleFor(x => x.Username).NotEmpty().MaximumLength(50);
            RuleFor(x => x.Password).NotEmpty().MinimumLength(6).MaximumLength(255);
            RuleFor(x => x.Name).MaximumLength(100);
            RuleFor(x => x.Email).MaximumLength(100);
            RuleFor(x => x.Phone).MaximumLength(20);
        }
    }
}

