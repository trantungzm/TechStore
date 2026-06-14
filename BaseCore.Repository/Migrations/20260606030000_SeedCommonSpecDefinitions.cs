using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BaseCore.Repository.Migrations
{
    /// <summary>
    /// Seed bộ "thông số chung" (IsVariantAxis=0) theo từng danh mục + một số options mẫu.
    /// Idempotent: chỉ chèn khi code chưa tồn tại trong danh mục. Không gồm RAM/Bộ nhớ/Màu (trục biến thể).
    /// </summary>
    public partial class SeedCommonSpecDefinitions : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
DECLARE @defs TABLE (CategoryId int, Code nvarchar(100), Name nvarchar(160), DataType nvarchar(30), IsFilterable bit, SortOrder int);
INSERT INTO @defs (CategoryId, Code, Name, DataType, IsFilterable, SortOrder) VALUES
(1,'screenSize',N'Kích thước màn hình','select',1,10),
(1,'screenTechnology',N'Công nghệ màn hình','select',1,20),
(1,'screenResolution',N'Độ phân giải màn hình','select',0,30),
(1,'refreshRate',N'Tần số quét','select',1,40),
(1,'chipset',N'Chipset','select',1,50),
(1,'rearCamera',N'Camera sau','select',0,60),
(1,'frontCamera',N'Camera trước','select',0,70),
(1,'battery',N'Dung lượng pin','select',1,80),
(1,'os',N'Hệ điều hành','select',1,90),
(1,'nfc',N'NFC','boolean',0,100),
(1,'sim',N'Thẻ SIM','select',0,110),
(1,'waterResistance',N'Kháng nước/bụi','select',0,120),
(2,'cpuType',N'Loại CPU','select',1,10),
(2,'graphicsType',N'Card đồ họa','select',1,20),
(2,'ramType',N'Loại RAM (DDR)','select',0,30),
(2,'ramSlots',N'Số khe RAM','select',0,40),
(2,'storageType',N'Loại ổ cứng (SSD/HDD)','select',1,50),
(2,'screenSize',N'Kích thước màn hình','select',1,60),
(2,'screenTechnology',N'Công nghệ màn hình','select',0,70),
(2,'screenResolution',N'Độ phân giải màn hình','select',0,80),
(2,'ports',N'Cổng giao tiếp','multiSelect',0,90),
(2,'os',N'Hệ điều hành','select',0,100),
(2,'weight',N'Trọng lượng','select',0,110),
(2,'battery',N'Pin','select',0,120),
(4,'screenSize',N'Kích thước màn hình','select',1,10),
(4,'screenTechnology',N'Công nghệ màn hình','select',0,20),
(4,'screenResolution',N'Độ phân giải màn hình','select',0,30),
(4,'chipset',N'Chipset','select',1,40),
(4,'rearCamera',N'Camera sau','select',0,50),
(4,'frontCamera',N'Camera trước','select',0,60),
(4,'battery',N'Dung lượng pin','select',0,70),
(4,'os',N'Hệ điều hành','select',1,80),
(4,'stylusSupport',N'Hỗ trợ bút cảm ứng','boolean',0,90),
(4,'cellular',N'Kết nối di động (4G/5G)','select',1,100),
(5,'caseSize',N'Kích thước mặt','select',1,10),
(5,'screenTechnology',N'Công nghệ màn hình','select',0,20),
(5,'caseMaterial',N'Chất liệu khung','select',0,30),
(5,'calling',N'Nghe gọi trên đồng hồ','boolean',1,40),
(5,'healthFeatures',N'Tiện ích sức khỏe','multiSelect',0,50),
(5,'batteryLife',N'Thời lượng pin','select',1,60),
(5,'waterResistance',N'Kháng nước','select',0,70),
(5,'compatibility',N'Tương thích','multiSelect',1,80),
(6,'sensorResolution',N'Độ phân giải cảm biến','select',1,10),
(6,'sensorType',N'Loại cảm biến','select',1,20),
(6,'lensMount',N'Ngàm ống kính','select',0,30),
(6,'videoResolution',N'Quay video tối đa','select',1,40),
(6,'screen',N'Màn hình','select',0,50),
(6,'isoRange',N'Dải ISO','select',0,60),
(6,'connectivity',N'Kết nối','multiSelect',0,70),
(6,'weight',N'Trọng lượng','select',0,80),
(7,'connectionType',N'Kiểu kết nối','select',1,10),
(7,'bluetoothVersion',N'Phiên bản Bluetooth','select',0,20),
(7,'batteryLife',N'Thời lượng pin','select',1,30),
(7,'anc',N'Chống ồn chủ động (ANC)','boolean',1,40),
(7,'waterResistance',N'Kháng nước','select',0,50),
(7,'driverSize',N'Đường kính driver','select',0,60),
(7,'microphone',N'Micro','boolean',0,70),
(7,'otherFeatures',N'Tính năng khác','multiSelect',0,80),
(8,'power',N'Công suất','select',1,10),
(8,'connectivity',N'Kết nối','multiSelect',1,20),
(8,'batteryLife',N'Thời lượng pin','select',0,30),
(8,'waterResistance',N'Kháng nước','select',0,40),
(8,'driverCount',N'Số loa/driver','select',0,50),
(8,'features',N'Tính năng','multiSelect',0,60),
(8,'weight',N'Trọng lượng','select',0,70);

INSERT INTO SpecDefinitions (CategoryId, Name, Code, DataType, InputType, SortOrder, IsRequired, IsFilterable, IsComparable, AllowCustomValue, IsActive, IsVariantAxis, CreatedAt)
SELECT d.CategoryId, d.Name, d.Code, d.DataType, d.DataType, d.SortOrder, 0, d.IsFilterable, 1, 1, 1, 0, GETUTCDATE()
FROM @defs d
WHERE NOT EXISTS (SELECT 1 FROM SpecDefinitions sd WHERE sd.CategoryId = d.CategoryId AND sd.Code = d.Code);

DECLARE @opts TABLE (CategoryId int, Code nvarchar(100), Value nvarchar(250), DisplayOrder int);
INSERT INTO @opts (CategoryId, Code, Value, DisplayOrder) VALUES
(1,'screenTechnology',N'AMOLED',1),(1,'screenTechnology',N'OLED',2),(1,'screenTechnology',N'IPS LCD',3),(1,'screenTechnology',N'LCD',4),
(1,'os',N'iOS',1),(1,'os',N'Android',2),
(1,'refreshRate',N'60Hz',1),(1,'refreshRate',N'90Hz',2),(1,'refreshRate',N'120Hz',3),(1,'refreshRate',N'144Hz',4),
(1,'sim',N'1 Nano SIM',1),(1,'sim',N'2 Nano SIM',2),(1,'sim',N'1 Nano SIM + eSIM',3),
(1,'waterResistance',N'IP67',1),(1,'waterResistance',N'IP68',2),
(2,'cpuType',N'Intel Core i3',1),(2,'cpuType',N'Intel Core i5',2),(2,'cpuType',N'Intel Core i7',3),(2,'cpuType',N'Intel Core i9',4),(2,'cpuType',N'AMD Ryzen 5',5),(2,'cpuType',N'AMD Ryzen 7',6),(2,'cpuType',N'Apple M-series',7),
(2,'storageType',N'SSD SATA',1),(2,'storageType',N'SSD NVMe',2),(2,'storageType',N'HDD',3),
(2,'ramType',N'DDR4',1),(2,'ramType',N'DDR5',2),(2,'ramType',N'LPDDR5',3),
(2,'os',N'Windows',1),(2,'os',N'macOS',2),(2,'os',N'Không có HĐH',3),
(4,'os',N'iPadOS',1),(4,'os',N'Android',2),
(4,'cellular',N'Chỉ WiFi',1),(4,'cellular',N'WiFi + 4G',2),(4,'cellular',N'WiFi + 5G',3),
(5,'waterResistance',N'5ATM',1),(5,'waterResistance',N'IP68',2),(5,'waterResistance',N'2ATM',3),
(6,'sensorType',N'Full-frame',1),(6,'sensorType',N'APS-C',2),(6,'sensorType',N'Micro 4/3',3),(6,'sensorType',N'1 inch',4),
(7,'connectionType',N'True Wireless',1),(7,'connectionType',N'Bluetooth',2),(7,'connectionType',N'Có dây',3),
(7,'bluetoothVersion',N'5.0',1),(7,'bluetoothVersion',N'5.2',2),(7,'bluetoothVersion',N'5.3',3),
(8,'connectivity',N'Bluetooth',1),(8,'connectivity',N'WiFi',2),(8,'connectivity',N'AUX 3.5mm',3),(8,'connectivity',N'USB-C',4);

INSERT INTO SpecOptions (SpecDefinitionId, Value, DisplayOrder, IsActive, CreatedAt)
SELECT sd.Id, o.Value, o.DisplayOrder, 1, GETUTCDATE()
FROM @opts o
JOIN SpecDefinitions sd ON sd.CategoryId = o.CategoryId AND sd.Code = o.Code
WHERE NOT EXISTS (SELECT 1 FROM SpecOptions so WHERE so.SpecDefinitionId = sd.Id AND so.Value = o.Value);
");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Seed nội dung — không tự gỡ (admin có thể đã bổ sung dữ liệu).
        }
    }
}
