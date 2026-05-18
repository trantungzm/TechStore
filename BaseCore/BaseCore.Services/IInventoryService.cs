using BaseCore.DTO.Inventory;

namespace BaseCore.Services
{
    public interface IInventoryService
    {
        Task<GoodsReceiptDto> CreateReceiptAsync(CreateGoodsReceiptDto dto, Guid? userId);
        Task<(List<GoodsReceiptDto> Items, int TotalCount)> GetReceiptsAsync(InventorySearchDto search);
        Task<GoodsReceiptDto?> GetReceiptAsync(int id);
        Task<(List<StockItemDto> Items, int TotalCount)> GetStockItemsAsync(InventorySearchDto search);
        Task<StockItemDto?> GetStockItemAsync(int id);
        Task<StockItemLookupDto?> LookupStockItemAsync(string serialOrImei);
        Task<StockItemDto?> UpdateStockItemStatusAsync(int id, UpdateStockItemStatusDto dto, Guid? userId);
        Task<List<StockItemDto>> AssignStockItemsAsync(AssignStockItemsDto dto, Guid? userId);
        Task<(List<AgedStockDto> Items, int TotalCount)> GetAgedStockAsync(AgedStockSearchDto search);
        Task<InventoryReturnDto> CreateReturnAsync(CreateInventoryReturnDto dto, Guid? userId);
        Task<(List<InventoryReturnDto> Items, int TotalCount)> GetReturnsAsync(InventoryReturnSearchDto search);
        Task<InventoryReturnDto?> GetReturnAsync(int id);
        Task<InventoryReturnDto?> ReviewReturnAsync(int id, ReviewInventoryReturnDto dto, Guid? userId);
        Task<InventoryReturnDto?> RestockReturnAsync(int id, RestockReturnDto dto, Guid? userId);
        Task<(List<StockMovementDto> Items, int TotalCount)> GetMovementsAsync(InventorySearchDto search);
    }
}
