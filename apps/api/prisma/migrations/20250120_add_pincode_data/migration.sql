-- CreateTable
CREATE TABLE `PincodeData` (
    `id` VARCHAR(191) NOT NULL,
    `pincode` VARCHAR(191) NOT NULL,
    `district` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `area` VARCHAR(191) NULL,

    UNIQUE INDEX `PincodeData_pincode_key`(`pincode`),
    INDEX `PincodeData_pincode_idx`(`pincode`),
    INDEX `PincodeData_city_idx`(`city`),
    INDEX `PincodeData_state_idx`(`state`),
    INDEX `PincodeData_district_idx`(`district`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
