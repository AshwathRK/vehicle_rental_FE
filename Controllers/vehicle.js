const { Vehicle, Category } = require('../Model/vehicle');
const User = require('../Model/user')

// ======================== CATEGORY CONTROLLERS ======================== //

// Command: Get all categories with image conversion to base64
const getAllCategory = async (req, res) => {
    try {
        const categories = await Category.find();

        if (!categories || categories.length === 0) {
            return res.status(404).json({
                message: 'No data found!'
            });
        }

        const formatted = categories.map(cat => ({
            _id: cat._id,
            category: cat.category,
            images: cat.images.map(img => {
                const base64 = img.data.toString('base64');
                return `data:${img.contentType};base64,${base64}`;
            })
        }));

        // console.log(formatted)
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

// Command: Get Category by ID
const getCategoryById = async (req, res) => {
    // debugger
    const { id } = req.params;

    try {
        const category = await Category.findOne({ _id: id });

        if (!category) {
            return res.status(404).json({
                message: 'No category found'
            });
        }

        return res.status(200).json({
            message: 'Data fetched successfully',
            category
        });
    } catch (error) {
        return res.status(500).json({
            message: `Something went wrong: ${error.message}`
        });
    }
};

// Command: Create a new category with image upload
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

// Command: Update an existing category and its images
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

// Command: Delete a category by ID
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

// ======================== VEHICLE CONTROLLERS ======================== //

// Command: Create a new vehicle with images and metadata
const createVehicle = async (req, res) => {
    try {
        // Parse stringified vehicleInfo sent in FormData
        const vehicleInfo = JSON.parse(req.body.vehicleInfo);

        const {
            make, model, registerModel, category, registerNumber, transmission,
            fuelType, mileage, seatingCapacity, numberOfDoors, airConditioning,
            luggageCapacity, insuranceType, provider, expiryDate, minLicense,
            minage, lastServiced, nextServiceDue, vehicleCondition, odometerReading,
            pickup, drop, city, doorDelivery, fuelPolicy, pricePerHour, pricePerDay,
            weekdiscount, monthlydiscount
        } = vehicleInfo;

        // Check for existing vehicle
        const existingVehicle = await Vehicle.findOne({ licensePlate: registerNumber });
        if (existingVehicle) {
            return res.status(409).json({
                status: false,
                message: "Vehicle with this license plate already exists."
            });
        }

        // Get category reference
        const getCategory = await Category.findOne({ category });

        // Handle uploaded images
        const imageBuffers = req.files?.map(file => ({
            data: file.buffer,
            contentType: file.mimetype
        })) || [];

        // Construct vehicle data
        const vehicleData = {
            make,
            model,
            year: registerModel, // Assuming this is what you meant
            category: getCategory?._id,
            licensePlate: registerNumber,
            transmission,
            fuelType,
            mileage,
            seatingCapacity,
            numberOfDoors,
            airConditioning: airConditioning === "Available" ? true : false,
            luggageCapacity,
            pricePerDay,
            pricePerHour,
            fuelPolicy,
            discounts: {
                weekly: weekdiscount,
                monthly: monthlydiscount,
            },
            location: {
                pickup,
                dropoff: drop,
                city,
                doorDelivery,
            },
            insurance: {
                type: insuranceType,
                provider,
                expiryDate
            },
            driverRequirements: {
                minAge: minage,
                licenseType: minLicense,
            },
            maintenance: {
                lastServiced,
                nextServiceDue,
                condition: vehicleCondition,
                odometerReading
            },
            userId: req.user.uID,
            isAdminApproved: false,
            images: imageBuffers
        };

        const { uID } = req.user

        const user = await User.findOne({ _id: uID })

        if (user.profileType === 'Admin') {
            vehicleData.isAdminApproved = true
        }

        // Save vehicle
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

// Command: Get admin approved vehicles
const getAdminApprovedVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.find({ isAdminApproved: true });
        res.status(200).json(vehicles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Command: Get admin approved vehicles
const getAdminNotApprovedVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.find({ isAdminApproved: false });
        res.status(200).json(vehicles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Command: Get vehicle details by ID
const getVehicleById = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);
        if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

        const formatted = {
            _id: vehicle._id,
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year,
            category: vehicle.category,
            transmission: vehicle.transmission,
            licensePlate: vehicle.licensePlate,
            transmission: vehicle.transmission,
            mileage: vehicle.mileage,
            seatingCapacity: vehicle.seatingCapacity,
            numberOfDoors: vehicle.numberOfDoors,
            airConditioning: vehicle.airConditioning,
            luggageCapacity: vehicle.luggageCapacity,
            insurance: vehicle.insurance,
            driverRequirements: vehicle.driverRequirements,
            maintenance: vehicle.maintenance,
            pickup: vehicle.pickup,
            dropoff: vehicle.dropoff,
            city: vehicle.city,
            delivery: vehicle.delivery,
            location: vehicle.location,
            fuelPolicy: vehicle.fuelPolicy,
            fuelType: vehicle.fuelType,
            pricePerHour: vehicle.pricePerHour,
            pricePerDay: vehicle.pricePerDay,
            discounts: vehicle.discounts,
            averageRating: vehicle.averageRating,
            reviewCount: vehicle.reviewCount,
            isAdminApproved: vehicle.isAdminApproved,
            userId: vehicle.userId,
            bookingCount: vehicle.bookingCount,
            images: vehicle.images.map(img => {
                return {
                    contentType: img.contentType,
                    data: img.data.toString('base64')
                };
            })

        }

        res.status(200).json(formatted);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Command: Get vehicle by userId
const getVehiclesByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        // Optional: Validate if user is affiliate
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Affiliate user not found' });
        }

        // Fetch all vehicles added by this user
        const vehicles = await Vehicle.find({ userId });

        if (vehicles.length === 0) {
            return res.status(404).json({ message: 'No vehicles found for this affiliate' });
        }

        return res.status(200).json({
            message: 'Vehicles fetched successfully',
            data: vehicles
        });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Command: Get the vehicles based on the filter
const getVehicleByFilter = async (req, res) => {
    // debugger
    try {
        const filterString = req.header('filter') || '{}';
        const search = req.header('search') || '';
        const pricerange = req.header('pricerange') || '';

        const filters = JSON.parse(filterString);

        const hasAnyFilters =
            (filters.categories && Object.values(filters.categories).filter(Boolean).length) ||
            (filters.transmission && Object.values(filters.transmission).filter(Boolean).length) ||
            (filters.fuelType && Object.values(filters.fuelType).filter(Boolean).length) ||
            (filters.seats && Object.values(filters.seats).filter(Boolean).length) ||
            (filters.userRatings && Object.values(filters.userRatings).filter(Boolean).length) ||
            search ||
            pricerange;

        const query = {
            isAdminApproved: true
        };

        if (hasAnyFilters) {
            // 🔘 Price Range
            if (pricerange) {
                const priceRange = pricerange.split(',').map(Number);
                query.pricePerDay = { $gte: priceRange[0], $lte: priceRange[1] };
            }

            // 🔘 Category (convert names to IDs)
            if (filters.categories) {
                const categoryNames = Object.values(filters.categories).filter(Boolean);
                if (categoryNames.length) {
                    const categoryDocs = await Category.find(
                        { category: { $in: categoryNames } },
                        { _id: 1 }
                    );
                    const categoryIds = categoryDocs.map(doc => doc._id);
                    if (categoryIds.length) query.category = { $in: categoryIds };
                }
            }

            // 🔘 Transmission
            if (filters.transmission) {
                const values = Object.keys(filters.transmission)
                    .filter(key => filters.transmission[key])
                    .map(str => str.charAt(0).toUpperCase() + str.slice(1)); // Capitalize
                if (values.length) query.transmission = { $in: values };
            }

            // 🔘 Fuel Type
            if (filters.fuelType) {
                const values = Object.keys(filters.fuelType)
                    .filter(key => filters.fuelType[key])
                    .map(str => str.charAt(0).toUpperCase() + str.slice(1));
                if (values.length) query.fuelType = { $in: values };
            }

            // 🔘 Seats
            if (filters.seats) {
                const selectedSeatLabels = Object.keys(filters.seats)
                    .filter(key => filters.seats[key]); // e.g. ['FourSeats', 'SixSeats']

                let seatRange = [];

                selectedSeatLabels.forEach(label => {
                    switch (label) {
                        case 'fourSeats':
                            seatRange.push(4, 5);
                            break;
                        case 'sixSeats':
                            seatRange.push(6, 7);
                            break;
                        case 'eightSeats':
                            seatRange.push(8, 9);
                            break;
                        // Add more cases if needed
                        default:
                            break;
                    }
                });

                // Remove duplicates and apply filter
                seatRange = [...new Set(seatRange)];
                if (seatRange.length) query.seatingCapacity = { $in: seatRange };
            }


            // 🔘 User Ratings
            if (filters.userRatings) {
                const selectedRatings = Object.keys(filters.userRatings)
                    .filter(key => filters.userRatings[key]); // e.g. ['fourRated']

                let minRating = 0;

                selectedRatings.forEach(label => {
                    switch (label.toLowerCase()) {
                        case 'fourfiverated':
                            minRating = Math.max(minRating, 4.5);
                            break;
                        case 'fourrated':
                            minRating = Math.max(minRating, 4.0);
                            break;
                        case 'threeeightrated':
                            minRating = Math.max(minRating, 3.8);
                            break;
                        case 'threefiverated':
                            minRating = Math.max(minRating, 3.5);
                            break;
                        case 'allrated':
                            minRating = 0; // No filtering
                            break;
                        default:
                            break;
                    }
                });

                if (minRating > 0) {
                    query.averageRating = { $gte: minRating };
                }
            }


            // 🔍 Search
            if (search) {
                query.$or = [
                    { make: { $regex: search, $options: 'i' } },
                    { model: { $regex: search, $options: 'i' } },
                    { licensePlate: { $regex: search, $options: 'i' } }
                ];
            }
        }



        const vehicles = await Vehicle.find(query);
        // console.log(vehicles.images)
        const formatted = vehicles.map(vehicle => ({
            _id: vehicle._id,
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year,
            transmission: vehicle.transmission,
            fuelType: vehicle.fuelType,
            pricePerDay: vehicle.pricePerDay,
            pricePerHour: vehicle.pricePerHour,
            bookingCount: vehicle.bookingCount,
            averageRating: vehicle.averageRating,
            reviewCount: vehicle.reviewCount,
            images: vehicle.images.map(img => {
                return {
                    contentType: img.contentType,
                    data: img.data.toString('base64')
                };
            })

        }))
        // console.log(formatted)
        res.status(200).json(formatted);

    } catch (error) {
        console.error('Error fetching filtered vehicles:', error);
        res.status(500).json({ error: 'Something went wrong while fetching vehicles.' });
    }
};

// Command: Get top 6 booked vehicles
const getTopBookedVehicles = async (req, res) => {
    try {
        const topVehicles = await Vehicle.find({ isAdminApproved: true })
            .sort({ bookingCount: -1 })
            .limit(6);

        if (!topVehicles || topVehicles.length === 0) {
            return res.status(404).json({ message: 'No vehicles found.' });
        }

        const formattedVehicles = topVehicles.map(vehicle => ({
            _id: vehicle._id,
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year,
            category: vehicle.category,
            bookingCount: vehicle.bookingCount,
            fuelType: vehicle.fuelType,
            transmission: vehicle.transmission,
            seatingCapacity: vehicle.seatingCapacity,
            pricePerDay: vehicle.pricePerDay,
            pricePerHour: vehicle.pricePerHour,
            delivery: vehicle.delivery,
            images: vehicle.images.map(img => ({
                data: img.data.toString('base64'),
                contentType: img.contentType
            }))
        }));

        return res.status(200).json({
            message: 'Top 6 booked vehicles fetched successfully.',
            vehicles: formattedVehicles
        });
    } catch (error) {
        return res.status(500).json({ message: `Error: ${error.message}` });
    }
};

// Command: Get low price vehicle
const getLowPriceVehicle = async (req, res) => {
    try {
        const lowPrice = await Vehicle.aggregate([{
            $group:
            {
                _id: {},
                minPrice: { $min: "$pricePerHour" },
                minPriceDay: { $min: "$pricePerDay" },
                maxPrice: { $max: "$pricePerHour" },
                maxPriceDay: { $max: "$pricePerDay" },
            }
        }])

        if (lowPrice.length === 0) {
            return res.status(404).json({
                message: "No data found!"
            })
        }

        return res.status(200).json({
            message: "The data fetched successfully",
            lowPrice
        })

    } catch (error) {
        return res.status(500).json({ message: `Error: ${error.message}` });
    }
}

// Command: Update an existing vehicle by ID
const updateVehicle = async (req, res) => {
    debugger
    try {
        const vehicleId = req.params.id;
        const vehicleInfo = JSON.parse(req.body.vehicleInfo);

        const {
            make, model, registerModel, category, registerNumber, transmission,
            fuelType, mileage, seatingCapacity, numberOfDoors, airConditioning,
            luggageCapacity, insuranceType, provider, expiryDate, minLicense,
            minage, lastServiced, nextServiceDue, vehicleCondition, odometerReading,
            pickup, drop, city, doorDelivery, fuelPolicy, pricePerHour, pricePerDay,
            weekdiscount, monthlydiscount
        } = vehicleInfo;

        const existingVehicle = await Vehicle.findById(vehicleId);
        if (!existingVehicle) {
            return res.status(404).json({
                status: false,
                message: "Vehicle not found."
            });
        }

        // Get category reference
        const getCategory = await Category.findOne({ _id: category });

        const updatedVehicleData = {};

        // Update image if provided
        if (req.files && req.files.length > 0) {
            const imageBuffers = req.files.map(file => ({
                data: file.buffer,
                contentType: file.mimetype
            }));
            updatedVehicleData.images = imageBuffers;
        }

        // Update other fields if body contains them
        if (Object.keys(req.body).length > 0) {
            // License plate uniqueness check only if licensePlate is changing
            if (registerNumber && registerNumber !== existingVehicle.licensePlate) {
                const vehicleWithLicensePlate = await Vehicle.findOne({ licensePlate: registerNumber });
                if (vehicleWithLicensePlate) {
                    return res.status(409).json({
                        status: false,
                        message: "Vehicle with this license plate already exists."
                    });
                }
            }

            Object.assign(updatedVehicleData, {
                make: make || existingVehicle.make,
                model: model || existingVehicle.model,
                year: registerModel || existingVehicle.year,
                category: getCategory?._id || existingVehicle.category,
                licensePlate: registerNumber || existingVehicle.licensePlate,
                transmission: transmission || existingVehicle.transmission,
                fuelType: fuelType || existingVehicle.fuelType,
                mileage: mileage || existingVehicle.mileage,
                seatingCapacity: seatingCapacity || existingVehicle.seatingCapacity,
                numberOfDoors: numberOfDoors || existingVehicle.numberOfDoors,
                airConditioning: airConditioning == 'Available' ? true : false || existingVehicle.airConditioning,
                luggageCapacity: luggageCapacity || existingVehicle.luggageCapacity,
                pricePerDay: pricePerDay || existingVehicle.pricePerDay,
                pricePerHour: pricePerHour || existingVehicle.pricePerHour,
                // deposit: deposit || existingVehicle.deposit,
                discounts: {
                    weekly: weekdiscount || existingVehicle.discounts.weekly,
                    monthly: monthlydiscount || existingVehicle.discounts.monthly,
                },
                fuelPolicy: fuelPolicy || existingVehicle.fuelPolicy,
                location: {
                    pickup: pickup || existingVehicle.location.pickup,
                    dropoff: drop || existingVehicle.location.dropoff,
                    city: city || existingVehicle.location.city
                },
                // availability: {
                //     isAvailable: availability?.isAvailable ?? existingVehicle.availability.isAvailable,
                //     availableFrom: availability?.availableFrom || existingVehicle.availability.availableFrom,
                //     availableTo: availability?.availableTo || existingVehicle.availability.availableTo,
                //     bookingStatus: availability?.bookingStatus || existingVehicle.availability.bookingStatus
                // },
                insurance: {
                    type: insuranceType || existingVehicle.insurance.type,
                    provider: provider || existingVehicle.insurance.provider,
                    expiryDate: expiryDate || existingVehicle.insurance.expiryDate
                },
                driverRequirements: {
                    minAge: minage || existingVehicle.driverRequirements.minAge,
                    licenseType: minLicense || existingVehicle.driverRequirements.licenseType
                },
                // termsAndConditions: termsAndConditions || existingVehicle.termsAndConditions,
                // cancellationPolicy: cancellationPolicy || existingVehicle.cancellationPolicy,
                maintenance: {
                    lastServiced: lastServiced || existingVehicle.maintenance.lastServiced,
                    nextServiceDue: nextServiceDue || existingVehicle.maintenance.nextServiceDue,
                    condition: vehicleCondition || existingVehicle.maintenance.condition,
                    odometerReading: odometerReading || existingVehicle.maintenance.odometerReading
                },
                delivery: doorDelivery || existingVehicle.delivery,
                // isAdminApproved: req.body.isAdminApproved ?? existingVehicle.isAdminApproved
            });
        }

        // Update only if something to update
        if (Object.keys(updatedVehicleData).length === 0) {
            return res.status(400).json({
                status: false,
                message: "No valid data provided to update."
            });
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
            message: "Failed to update, but no critical error occurred."
        });
    }
};

// Command: Delete a vehicle by ID
const deleteVehicle = async (req, res) => {
    try {
        const deleted = await Vehicle.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Vehicle not found' });
        res.status(200).json({ message: 'Vehicle deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Export all controllers
module.exports = {
    getAllCategory,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    createVehicle,
    getAdminApprovedVehicles,
    getAdminNotApprovedVehicles,
    getVehicleById,
    getVehicleByFilter,
    getTopBookedVehicles,
    getVehiclesByUserId,
    getLowPriceVehicle,
    updateVehicle,
    deleteVehicle
};
