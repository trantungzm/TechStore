using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BaseCore.Repository.Migrations
{
    /// <summary>
    /// Seed option cho thong so chung cua Product cha.
    /// Khong gom option truc bien the nhu RAM, bo nho, mau sac, phien ban.
    /// Idempotent theo CategoryId + SpecDefinition.Code + Value.
    /// </summary>
    public partial class SeedCommonSpecOptions : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
DECLARE @opts TABLE (CategoryId int, Code nvarchar(100), Value nvarchar(250), DisplayOrder int);

INSERT INTO @opts (CategoryId, Code, Value, DisplayOrder) VALUES
-- Dien thoai
(1,'screenSize',N'6.1 inch',1),(1,'screenSize',N'6.3 inch',2),(1,'screenSize',N'6.5 inch',3),(1,'screenSize',N'6.7 inch',4),(1,'screenSize',N'6.9 inch',5),
(1,'screenResolution',N'HD+',1),(1,'screenResolution',N'Full HD+',2),(1,'screenResolution',N'1.5K',3),(1,'screenResolution',N'2K',4),(1,'screenResolution',N'Quad HD+',5),
(1,'chipset',N'Apple A16 Bionic',1),(1,'chipset',N'Apple A17 Pro',2),(1,'chipset',N'Apple A18 Pro',3),(1,'chipset',N'Snapdragon 8 Gen 2',4),(1,'chipset',N'Snapdragon 8 Gen 3',5),(1,'chipset',N'Snapdragon 8 Elite',6),(1,'chipset',N'MediaTek Dimensity 8300',7),(1,'chipset',N'MediaTek Dimensity 9300',8),
(1,'rearCamera',N'12MP',1),(1,'rearCamera',N'48MP',2),(1,'rearCamera',N'50MP',3),(1,'rearCamera',N'50MP + 12MP',4),(1,'rearCamera',N'50MP + 50MP + 12MP',5),(1,'rearCamera',N'200MP + 12MP + 10MP',6),
(1,'frontCamera',N'8MP',1),(1,'frontCamera',N'12MP',2),(1,'frontCamera',N'16MP',3),(1,'frontCamera',N'32MP',4),(1,'frontCamera',N'50MP',5),
(1,'battery',N'Duoi 4000 mAh',1),(1,'battery',N'4000 - 4499 mAh',2),(1,'battery',N'4500 - 4999 mAh',3),(1,'battery',N'5000 - 5499 mAh',4),(1,'battery',N'Tu 5500 mAh tro len',5),

-- Laptop
(2,'graphicsType',N'Integrated Intel Graphics',1),(2,'graphicsType',N'Intel Iris Xe',2),(2,'graphicsType',N'Apple GPU',3),(2,'graphicsType',N'AMD Radeon',4),(2,'graphicsType',N'NVIDIA GeForce RTX 3050',5),(2,'graphicsType',N'NVIDIA GeForce RTX 4050',6),(2,'graphicsType',N'NVIDIA GeForce RTX 4060',7),(2,'graphicsType',N'NVIDIA GeForce RTX 4070',8),
(2,'ramSlots',N'Onboard',1),(2,'ramSlots',N'1 khe',2),(2,'ramSlots',N'2 khe',3),(2,'ramSlots',N'4 khe',4),(2,'ramSlots',N'Onboard + 1 khe',5),
(2,'screenSize',N'13 inch',1),(2,'screenSize',N'13.3 inch',2),(2,'screenSize',N'14 inch',3),(2,'screenSize',N'15.6 inch',4),(2,'screenSize',N'16 inch',5),(2,'screenSize',N'17.3 inch',6),
(2,'screenTechnology',N'IPS',1),(2,'screenTechnology',N'OLED',2),(2,'screenTechnology',N'Mini LED',3),(2,'screenTechnology',N'Liquid Retina',4),(2,'screenTechnology',N'Anti-glare',5),(2,'screenTechnology',N'WVA',6),
(2,'screenResolution',N'Full HD',1),(2,'screenResolution',N'Full HD+',2),(2,'screenResolution',N'2K',3),(2,'screenResolution',N'2.5K',4),(2,'screenResolution',N'3K',5),(2,'screenResolution',N'4K',6),
(2,'ports',N'USB-A',1),(2,'ports',N'USB-C',2),(2,'ports',N'Thunderbolt 4',3),(2,'ports',N'HDMI',4),(2,'ports',N'LAN RJ45',5),(2,'ports',N'Jack 3.5mm',6),(2,'ports',N'Doc the SD',7),
(2,'weight',N'Duoi 1 kg',1),(2,'weight',N'1.0 - 1.3 kg',2),(2,'weight',N'1.3 - 1.6 kg',3),(2,'weight',N'1.6 - 2.0 kg',4),(2,'weight',N'Tren 2.0 kg',5),
(2,'battery',N'Duoi 40 Wh',1),(2,'battery',N'40 - 49 Wh',2),(2,'battery',N'50 - 59 Wh',3),(2,'battery',N'60 - 79 Wh',4),(2,'battery',N'Tu 80 Wh tro len',5),

-- Tablet
(4,'screenSize',N'8 inch',1),(4,'screenSize',N'10.1 inch',2),(4,'screenSize',N'10.9 inch',3),(4,'screenSize',N'11 inch',4),(4,'screenSize',N'12.4 inch',5),(4,'screenSize',N'12.9 inch',6),(4,'screenSize',N'13 inch',7),
(4,'screenTechnology',N'IPS LCD',1),(4,'screenTechnology',N'LCD',2),(4,'screenTechnology',N'OLED',3),(4,'screenTechnology',N'AMOLED',4),(4,'screenTechnology',N'Liquid Retina',5),(4,'screenTechnology',N'Mini LED',6),
(4,'screenResolution',N'HD+',1),(4,'screenResolution',N'Full HD+',2),(4,'screenResolution',N'2K',3),(4,'screenResolution',N'2.5K',4),(4,'screenResolution',N'Liquid Retina',5),
(4,'chipset',N'Apple A14 Bionic',1),(4,'chipset',N'Apple A16',2),(4,'chipset',N'Apple M2',3),(4,'chipset',N'Apple M4',4),(4,'chipset',N'Snapdragon 7s Gen 2',5),(4,'chipset',N'Snapdragon 8 Gen 2',6),(4,'chipset',N'MediaTek Helio G99',7),
(4,'rearCamera',N'8MP',1),(4,'rearCamera',N'12MP',2),(4,'rearCamera',N'13MP',3),(4,'rearCamera',N'13MP + 8MP',4),
(4,'frontCamera',N'5MP',1),(4,'frontCamera',N'8MP',2),(4,'frontCamera',N'12MP',3),(4,'frontCamera',N'12MP Ultra Wide',4),
(4,'battery',N'Duoi 6000 mAh',1),(4,'battery',N'6000 - 7999 mAh',2),(4,'battery',N'8000 - 9999 mAh',3),(4,'battery',N'Tu 10000 mAh tro len',4),

-- Dong ho thong minh
(5,'caseSize',N'40mm',1),(5,'caseSize',N'41mm',2),(5,'caseSize',N'42mm',3),(5,'caseSize',N'44mm',4),(5,'caseSize',N'45mm',5),(5,'caseSize',N'46mm',6),(5,'caseSize',N'49mm',7),
(5,'screenTechnology',N'AMOLED',1),(5,'screenTechnology',N'OLED',2),(5,'screenTechnology',N'LTPO OLED',3),(5,'screenTechnology',N'Retina OLED',4),(5,'screenTechnology',N'TFT LCD',5),
(5,'caseMaterial',N'Nhom',1),(5,'caseMaterial',N'Thep khong gi',2),(5,'caseMaterial',N'Titanium',3),(5,'caseMaterial',N'Polymer',4),(5,'caseMaterial',N'Nhua',5),
(5,'healthFeatures',N'Do nhip tim',1),(5,'healthFeatures',N'Do SpO2',2),(5,'healthFeatures',N'Theo doi giac ngu',3),(5,'healthFeatures',N'Do ECG',4),(5,'healthFeatures',N'Do muc cang thang',5),(5,'healthFeatures',N'Theo doi chu ky kinh nguyet',6),(5,'healthFeatures',N'Canh bao te nga',7),
(5,'batteryLife',N'1 ngay',1),(5,'batteryLife',N'2 ngay',2),(5,'batteryLife',N'3 - 5 ngay',3),(5,'batteryLife',N'7 ngay',4),(5,'batteryLife',N'10 ngay',5),(5,'batteryLife',N'14 ngay',6),(5,'batteryLife',N'Tren 14 ngay',7),
(5,'compatibility',N'iOS',1),(5,'compatibility',N'Android',2),(5,'compatibility',N'iOS va Android',3),(5,'compatibility',N'Samsung Galaxy',4),(5,'compatibility',N'Huawei Health',5),

-- May anh
(6,'sensorResolution',N'12MP',1),(6,'sensorResolution',N'20MP',2),(6,'sensorResolution',N'24MP',3),(6,'sensorResolution',N'26MP',4),(6,'sensorResolution',N'33MP',5),(6,'sensorResolution',N'45MP',6),(6,'sensorResolution',N'61MP',7),
(6,'lensMount',N'Canon RF',1),(6,'lensMount',N'Canon EF-M',2),(6,'lensMount',N'Sony E-mount',3),(6,'lensMount',N'Nikon Z',4),(6,'lensMount',N'Fujifilm X',5),(6,'lensMount',N'Micro Four Thirds',6),
(6,'videoResolution',N'Full HD 60fps',1),(6,'videoResolution',N'4K 30fps',2),(6,'videoResolution',N'4K 60fps',3),(6,'videoResolution',N'5.3K',4),(6,'videoResolution',N'6K',5),(6,'videoResolution',N'8K',6),
(6,'screen',N'Co dinh',1),(6,'screen',N'Lat nghieng',2),(6,'screen',N'Lat xoay cam ung',3),(6,'screen',N'Cam ung',4),(6,'screen',N'Khong co man hinh',5),
(6,'isoRange',N'ISO 100 - 12800',1),(6,'isoRange',N'ISO 100 - 25600',2),(6,'isoRange',N'ISO 100 - 32000',3),(6,'isoRange',N'ISO 100 - 51200',4),(6,'isoRange',N'ISO 50 - 102400',5),
(6,'connectivity',N'WiFi',1),(6,'connectivity',N'Bluetooth',2),(6,'connectivity',N'USB-C',3),(6,'connectivity',N'HDMI',4),(6,'connectivity',N'Micro HDMI',5),(6,'connectivity',N'NFC',6),
(6,'weight',N'Duoi 300g',1),(6,'weight',N'300 - 499g',2),(6,'weight',N'500 - 699g',3),(6,'weight',N'700 - 999g',4),(6,'weight',N'Tu 1kg tro len',5),

-- Tai nghe
(7,'batteryLife',N'Duoi 5 gio',1),(7,'batteryLife',N'5 - 8 gio',2),(7,'batteryLife',N'8 - 12 gio',3),(7,'batteryLife',N'12 - 24 gio',4),(7,'batteryLife',N'Tren 24 gio',5),
(7,'waterResistance',N'Khong',1),(7,'waterResistance',N'IPX4',2),(7,'waterResistance',N'IPX5',3),(7,'waterResistance',N'IPX7',4),(7,'waterResistance',N'IP54',5),(7,'waterResistance',N'IP57',6),
(7,'driverSize',N'6mm',1),(7,'driverSize',N'8mm',2),(7,'driverSize',N'10mm',3),(7,'driverSize',N'11mm',4),(7,'driverSize',N'12mm',5),(7,'driverSize',N'40mm',6),
(7,'otherFeatures',N'Chong on ANC',1),(7,'otherFeatures',N'Xuyen am',2),(7,'otherFeatures',N'Am thanh khong gian',3),(7,'otherFeatures',N'Micro ENC',4),(7,'otherFeatures',N'Sac nhanh',5),(7,'otherFeatures',N'Dieu khien cam ung',6),(7,'otherFeatures',N'Gaming mode',7),

-- Audio
(8,'power',N'Duoi 10W',1),(8,'power',N'10W - 20W',2),(8,'power',N'20W - 50W',3),(8,'power',N'50W - 100W',4),(8,'power',N'100W - 300W',5),(8,'power',N'Tren 300W',6),
(8,'batteryLife',N'Khong dung pin',1),(8,'batteryLife',N'Duoi 5 gio',2),(8,'batteryLife',N'5 - 10 gio',3),(8,'batteryLife',N'10 - 20 gio',4),(8,'batteryLife',N'Tren 20 gio',5),
(8,'waterResistance',N'Khong',1),(8,'waterResistance',N'IPX4',2),(8,'waterResistance',N'IPX5',3),(8,'waterResistance',N'IPX7',4),(8,'waterResistance',N'IP67',5),(8,'waterResistance',N'IP68',6),
(8,'driverCount',N'1 loa',1),(8,'driverCount',N'2 loa',2),(8,'driverCount',N'2.1 kenh',3),(8,'driverCount',N'3.1 kenh',4),(8,'driverCount',N'5.1 kenh',5),(8,'driverCount',N'Soundbar + Subwoofer',6),
(8,'features',N'Dolby Atmos',1),(8,'features',N'DTS:X',2),(8,'features',N'PartyBoost',3),(8,'features',N'Bass Boost',4),(8,'features',N'Karaoke',5),(8,'features',N'Tro ly ao',6),(8,'features',N'Am thanh 360',7),
(8,'weight',N'Duoi 500g',1),(8,'weight',N'500g - 1kg',2),(8,'weight',N'1kg - 3kg',3),(8,'weight',N'3kg - 10kg',4),(8,'weight',N'Tren 10kg',5);

INSERT INTO SpecOptions (SpecDefinitionId, Value, DisplayOrder, IsActive, CreatedAt)
SELECT sd.Id, o.Value, o.DisplayOrder, 1, GETUTCDATE()
FROM @opts o
JOIN SpecDefinitions sd ON sd.CategoryId = o.CategoryId AND sd.Code = o.Code
WHERE sd.IsVariantAxis = 0
  AND NOT EXISTS (
      SELECT 1
      FROM SpecOptions so
      WHERE so.SpecDefinitionId = sd.Id AND so.Value = o.Value
  );
");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Seed noi dung, khong tu go vi admin co the da dung/chinh sua option.
        }
    }
}
