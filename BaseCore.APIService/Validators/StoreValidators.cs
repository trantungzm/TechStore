using BaseCore.DTO.Store;
using FluentValidation;

namespace BaseCore.APIService.Validators
{
    public class CategoryUpsertDtoValidator : AbstractValidator<CategoryUpsertDto>
    {
        public CategoryUpsertDtoValidator()
        {
            RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
            RuleFor(x => x.Description).MaximumLength(500);
        }
    }

    public class ProductCreateDtoValidator : AbstractValidator<ProductCreateDto>
    {
        public ProductCreateDtoValidator()
        {
            RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
            RuleFor(x => x.Price).GreaterThanOrEqualTo(0);
            RuleFor(x => x.Stock).GreaterThanOrEqualTo(0);
            RuleFor(x => x.CategoryId).GreaterThan(0);
            RuleFor(x => x.Description).MaximumLength(1000);
            RuleFor(x => x.ImageUrl).MaximumLength(500);
        }
    }

    public class ProductUpdateDtoValidator : AbstractValidator<ProductUpdateDto>
    {
        public ProductUpdateDtoValidator()
        {
            When(x => x.Name != null, () => RuleFor(x => x.Name!).NotEmpty().MaximumLength(200));
            When(x => x.Price.HasValue, () => RuleFor(x => x.Price!.Value).GreaterThanOrEqualTo(0));
            When(x => x.Stock.HasValue, () => RuleFor(x => x.Stock!.Value).GreaterThanOrEqualTo(0));
            When(x => x.CategoryId.HasValue, () => RuleFor(x => x.CategoryId!.Value).GreaterThan(0));
            When(x => x.Description != null, () => RuleFor(x => x.Description!).MaximumLength(1000));
            When(x => x.ImageUrl != null, () => RuleFor(x => x.ImageUrl!).MaximumLength(500));
        }
    }

    public class OrderItemDtoValidator : AbstractValidator<OrderItemDto>
    {
        public OrderItemDtoValidator()
        {
            RuleFor(x => x.ProductId).GreaterThan(0);
            RuleFor(x => x.Quantity).GreaterThan(0);
        }
    }

    public class CreateOrderDtoValidator : AbstractValidator<CreateOrderDto>
    {
        public CreateOrderDtoValidator()
        {
            RuleFor(x => x.Items).NotNull().NotEmpty();
            RuleForEach(x => x.Items).SetValidator(new OrderItemDtoValidator());
            RuleFor(x => x.ShippingAddress).MaximumLength(500);
        }
    }

    public class UpdateOrderStatusDtoValidator : AbstractValidator<UpdateOrderStatusDto>
    {
        public UpdateOrderStatusDtoValidator()
        {
            RuleFor(x => x.Status).NotEmpty().MaximumLength(50);
        }
    }
}

