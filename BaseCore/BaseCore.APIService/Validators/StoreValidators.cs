using BaseCore.DTO.Store;
using BaseCore.DTO.Inventory;
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
            RuleFor(x => x.SupplyType).MaximumLength(80);
            RuleFor(x => x.WarrantyProvider).MaximumLength(160);
            RuleFor(x => x).Must(x => !x.SupplierId.HasValue || !x.BackupSupplierId.HasValue || x.SupplierId != x.BackupSupplierId)
                .WithMessage("Backup supplier must be different from supplier");
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
            When(x => x.SupplyType != null, () => RuleFor(x => x.SupplyType!).MaximumLength(80));
            When(x => x.WarrantyProvider != null, () => RuleFor(x => x.WarrantyProvider!).MaximumLength(160));
            RuleFor(x => x).Must(x => !x.SupplierId.HasValue || !x.BackupSupplierId.HasValue || x.SupplierId != x.BackupSupplierId)
                .WithMessage("Backup supplier must be different from supplier");
        }
    }

    public class SupplierUpsertDtoValidator : AbstractValidator<SupplierUpsertDto>
    {
        public SupplierUpsertDtoValidator()
        {
            RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
            RuleFor(x => x.SupplierCode).MaximumLength(40);
            RuleFor(x => x.Code).MaximumLength(40);
            RuleFor(x => x.Phone).MaximumLength(30);
            RuleFor(x => x.Email).EmailAddress().When(x => !string.IsNullOrWhiteSpace(x.Email));
            RuleFor(x => x.Address).MaximumLength(300);
            RuleFor(x => x.TaxCode).MaximumLength(40);
            RuleFor(x => x.ContactPerson).MaximumLength(160);
            RuleFor(x => x.SupplierType).Must(x => string.IsNullOrWhiteSpace(x) || Enum.TryParse<BaseCore.Entities.SupplierType>(x, true, out _))
                .WithMessage("Invalid supplier type");
            RuleFor(x => x.Note).MaximumLength(1000);
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
            RuleFor(x => x.CustomerName).NotEmpty().MaximumLength(160);
            RuleFor(x => x.CustomerPhone).NotEmpty().MinimumLength(9).MaximumLength(30);
            RuleFor(x => x.CustomerEmail).EmailAddress().When(x => !string.IsNullOrWhiteSpace(x.CustomerEmail));
            RuleFor(x => x.PaymentMethod).NotEmpty().MaximumLength(40);
            RuleFor(x => x.PaymentStatus).MaximumLength(40);
            RuleFor(x => x.TransactionId).MaximumLength(120);
            RuleFor(x => x.ShippingMethod).NotEmpty().MaximumLength(40);
            When(x => string.Equals(x.ShippingMethod, "Delivery", StringComparison.OrdinalIgnoreCase), () =>
            {
                RuleFor(x => x.Province).NotEmpty();
                RuleFor(x => x.District).NotEmpty();
                RuleFor(x => x.Ward).NotEmpty();
                RuleFor(x => x.AddressDetail).NotEmpty();
            });
            When(x => string.Equals(x.ShippingMethod, "StorePickup", StringComparison.OrdinalIgnoreCase), () =>
            {
                RuleFor(x => x.StorePickupLocation).NotEmpty();
            });
        }
    }

    public class UpdateOrderStatusDtoValidator : AbstractValidator<UpdateOrderStatusDto>
    {
        public UpdateOrderStatusDtoValidator()
        {
            RuleFor(x => x.Status).NotEmpty().MaximumLength(50);
            RuleFor(x => x.PaymentStatus).MaximumLength(40);
            RuleFor(x => x.TransactionId).MaximumLength(120);
            RuleFor(x => x.Note).MaximumLength(500);
        }
    }
}
