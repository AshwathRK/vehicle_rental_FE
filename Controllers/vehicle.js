const { Vehicle, Category } = require('../Model/vehicle')

//Get All Category
const getAllCategory = async (req, res) => {
    try {
        const categories = await Category.find();

        if (!categories || categories.length === 0) {
            return res.status(404).json({
                message: 'No data found!'
            });
        }

        // Convert image buffer to base64
        const formatted = categories.map(cat => ({
            _id: cat._id,
            category: cat.category,
            images: cat.images.map(img => {
                const base64 = img.data.toString('base64');
                return `data:${img.contentType};base64,${base64}`;
            })
        }));

        return res.status(200).json({
            message: 'Category fetched successfully',
            responce: formatted
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};


// Create category
const createCategory = async (req, res) => {
    try {
        const { category } = req.body;
        const images = req.files?.map(file => ({
            data: file.buffer,
            contentType: file.mimetype
        }));

        if (!category) {
            return res.status(400).json({ message: "Category name is required" });
        }

        const newCategory = new Category({ category, images });

        await newCategory.save();

        res.status(201).json({
            message: "Category created successfully",
            category: newCategory
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update Category
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { category } = req.body;

        const updateData = { category };

        if (req.files && req.files.length > 0) {
            updateData.images = req.files.map(file => ({
                data: file.buffer,
                contentType: file.mimetype
            }));
        }

        const updated = await Category.findByIdAndUpdate(id, updateData, { new: true });

        if (!updated) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json({
            message: "Category updated successfully",
            category: updated
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


//Delete category

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await Category.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json({
            message: "Category deleted successfully",
            category: deleted
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// CREATE a new vehicle
const createVehicle = async (req, res) => {
    try {
        const {
            make, model, year, category, licensePlate, transmission, fuelType,
            pricePerDay, location, insurance, driverRequirements,
            termsAndConditions, cancellationPolicy, maintenance, userId
        } = req.body;

        const requiredFields = {
            make, model, year, category, licensePlate, transmission, fuelType,
            pricePerDay, 'location.pickup': location?.pickup, userId
        };

        for (const [key, value] of Object.entries(requiredFields)) {
            if (!value) {
                return res.status(400).json({
                    status: false,
                    message: `${key} is required.`
                });
            }
        }

        const existingVehicle = await Vehicle.findOne({ licensePlate });
        if (existingVehicle) {
            return res.status(409).json({
                status: false,
                message: "Vehicle with this license plate already exists."
            });
        }

        const imageBuffers = req.files?.map(file => ({
            data: file.buffer,
            contentType: file.mimetype
        }));

        const vehicleData = {
            make, model, year, category, licensePlate, transmission, fuelType,
            mileage: req.body.mileage,
            seatingCapacity: req.body.seatingCapacity,
            numberOfDoors: req.body.numberOfDoors,
            airConditioning: req.body.airConditioning,
            luggageCapacity: req.body.luggageCapacity,
            pricePerDay, pricePerHour: req.body.pricePerHour, deposit: req.body.deposit,
            discounts: req.body.discounts,
            fuelPolicy: req.body.fuelPolicy,
            location: {
                pickup: location.pickup,
                dropoff: location.dropoff,
                city: location.city
            },
            insurance: {
                type: insurance.type,
                provider: insurance.provider,
                expiryDate: insurance.expiryDate
            },
            driverRequirements: {
                minAge: driverRequirements.minAge,
                licenseType: driverRequirements.licenseType
            },
            termsAndConditions, cancellationPolicy,
            maintenance: {
                lastServiced: maintenance.lastServiced,
                nextServiceDue: maintenance.nextServiceDue,
                condition: maintenance.condition,
                odometerReading: maintenance.odometerReading
            },
            userId, isAdminApproved: req.body.isAdminApproved,
            images: imageBuffers || []
        };

        const newVehicle = await Vehicle.create(vehicleData);
        return res.status(201).json({
            status: true,
            message: "Vehicle created successfully.",
            vehicle: newVehicle
        });

    } catch (error) {
        console.error("Vehicle creation error:", error);
        return res.status(500).json({
            status: false,
            message: "An internal server error occurred."
        });
    }
};

// READ all vehicles
const getVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.find();
        res.status(200).json(vehicles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// READ single vehicle
const getVehicleById = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);
        if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
        res.status(200).json(vehicle);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// UPDATE vehicle
const updateVehicle = async (req, res) => {
    debugger
    try {
        const vehicleId = req.params.id;
        const {
            make, model, year, category, licensePlate, transmission, fuelType,
            pricePerDay, location, availability, insurance, driverRequirements,
            termsAndConditions, cancellationPolicy, maintenance, userId
        } = req.body;

        const existingVehicle = await Vehicle.findById(vehicleId);
        if (!existingVehicle) {
            return res.status(404).json({
                status: false,
                message: "Vehicle not found."
            });
        }

        // Check if license plate is being updated and if it already exists
        if (licensePlate && licensePlate !== existingVehicle.licensePlate) {
            const vehicleWithLicensePlate = await Vehicle.findOne({ licensePlate });
            if (vehicleWithLicensePlate) {
                return res.status(409).json({
                    status: false,
                    message: "Vehicle with this license plate already exists."
                });
            }
        }

        // Update vehicle data
        const updatedVehicleData = {
            make: make || existingVehicle.make,
            model: model || existingVehicle.model,
            year: year || existingVehicle.year,
            category: category || existingVehicle.category,
            licensePlate: licensePlate || existingVehicle.licensePlate,
            transmission: transmission || existingVehicle.transmission,
            fuelType: fuelType || existingVehicle.fuelType,
            mileage: req.body.mileage || existingVehicle.mileage,
            seatingCapacity: req.body.seatingCapacity || existingVehicle.seatingCapacity,
            numberOfDoors: req.body.numberOfDoors || existingVehicle.numberOfDoors,
            airConditioning: req.body.airConditioning || existingVehicle.airConditioning,
            luggageCapacity: req.body.luggageCapacity || existingVehicle.luggageCapacity,
            pricePerDay: pricePerDay || existingVehicle.pricePerDay,
            pricePerHour: req.body.pricePerHour || existingVehicle.pricePerHour,
            deposit: req.body.deposit || existingVehicle.deposit,
            discounts: req.body.discounts || existingVehicle.discounts,
            fuelPolicy: req.body.fuelPolicy || existingVehicle.fuelPolicy,
            location: {
                pickup: location?.pickup || existingVehicle.location.pickup,
                dropoff: location?.dropoff || existingVehicle.location.dropoff,
                city: location?.city || existingVehicle.location.city
            },
            availability: {
                isAvailable: availability?.isAvailable || existingVehicle.availability.isAvailable,
                availableFrom: availability?.availableFrom || existingVehicle.availability.availableFrom,
                availableTo: availability?.availableTo || existingVehicle.availability.availableTo,
                bookingStatus: availability?.bookingStatus || existingVehicle.availability.bookingStatus
            },
            insurance: {
                type: insurance?.type || existingVehicle.insurance.type,
                provider: insurance?.provider || existingVehicle.insurance.provider,
                expiryDate: insurance?.expiryDate || existingVehicle.insurance.expiryDate
            },
            driverRequirements: {
                minAge: driverRequirements?.minAge || existingVehicle.driverRequirements.minAge,
                licenseType: driverRequirements?.licenseType || existingVehicle.driverRequirements.licenseType
            },
            termsAndConditions: termsAndConditions || existingVehicle.termsAndConditions,
            cancellationPolicy: cancellationPolicy || existingVehicle.cancellationPolicy,
            maintenance: {
                lastServiced: maintenance?.lastServiced || existingVehicle.maintenance.lastServiced,
                nextServiceDue: maintenance?.nextServiceDue || existingVehicle.maintenance.nextServiceDue,
                condition: maintenance?.condition || existingVehicle.maintenance.condition,
                odometerReading: maintenance?.odometerReading || existingVehicle.maintenance.odometerReading
            },
            userId: userId || existingVehicle.userId,
            isAdminApproved: req.body.isAdminApproved || existingVehicle.isAdminApproved
        };

        // Update images if provided
        if (req.files) {
            const imageBuffers = req.files.map(file => ({
                data: file.buffer,
                contentType: file.mimetype
            }));
            updatedVehicleData.images = imageBuffers;
        }

        const updatedVehicle = await Vehicle.findByIdAndUpdate(vehicleId, updatedVehicleData, { new: true });
        return res.status(200).json({
            status: true,
            message: "Vehicle updated successfully.",
            vehicle: updatedVehicle
        });

    } catch (error) {
        console.error("Vehicle update error:", error);
        return res.status(500).json({
            status: false,
            message: "An internal server error occurred."
        });
    }
};

// DELETE vehicle
const deleteVehicle = async (req, res) => {
    try {
        const deleted = await Vehicle.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Vehicle not found' });
        res.status(200).json({ message: 'Vehicle deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


module.exports = {
    getAllCategory,
    createCategory,
    updateCategory,
    deleteCategory,
    createVehicle,
    getVehicles,
    getVehicleById,
    updateVehicle,
    deleteVehicle
};