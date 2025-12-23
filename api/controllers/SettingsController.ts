import { Request, Response } from 'express';
import { DatabaseService } from '../services/DatabaseService';
import { logger } from '../utils/logger';

export class SettingsController {
    /**
     * Get all settings grouped by category
     */
    static async getAllSettings(req: Request, res: Response) {
        try {
            const settings = await DatabaseService.query(`
                SELECT key, value, category, description
                FROM settings
                ORDER BY category, key
            `);

            // Group by category
            const grouped = settings.reduce((acc: any, setting: any) => {
                if (!acc[setting.category]) {
                    acc[setting.category] = {};
                }

                // Try to parse JSON values
                let value = setting.value;
                try {
                    value = JSON.parse(setting.value);
                } catch {
                    // Keep as string if not JSON
                }

                acc[setting.category][setting.key] = value;
                return acc;
            }, {});

            res.json({
                success: true,
                data: grouped
            });
        } catch (error: any) {
            logger.error('Error fetching settings:', error);
            res.status(500).json({
                success: false,
                error: {
                    message: 'Error al obtener configuración',
                    details: error.message
                }
            });
        }
    }

    /**
     * Get settings by category
     */
    static async getSettingsByCategory(req: Request, res: Response) {
        try {
            const { category } = req.params;

            const settings = await DatabaseService.query(`
                SELECT key, value, description
                FROM settings
                WHERE category = ?
                ORDER BY key
            `, [category]);

            const result = settings.reduce((acc: any, setting: any) => {
                let value = setting.value;
                try {
                    value = JSON.parse(setting.value);
                } catch {
                    // Keep as string
                }
                acc[setting.key] = value;
                return acc;
            }, {});

            res.json({
                success: true,
                data: result
            });
        } catch (error: any) {
            logger.error('Error fetching settings by category:', error);
            res.status(500).json({
                success: false,
                error: {
                    message: 'Error al obtener configuración',
                    details: error.message
                }
            });
        }
    }

    /**
     * Get store info (location, contact, hours)
     */
    static async getStoreInfo(req: Request, res: Response) {
        try {
            const settings = await DatabaseService.query(`
                SELECT key, value, category
                FROM settings
                WHERE category IN ('location', 'contact', 'hours', 'general')
                ORDER BY category, key
            `);

            const storeInfo: any = {
                location: {},
                contact: {},
                hours: {},
                general: {}
            };

            settings.forEach((setting: any) => {
                let value = setting.value;
                try {
                    value = JSON.parse(setting.value);
                } catch {
                    // Keep as string
                }
                storeInfo[setting.category][setting.key] = value;
            });

            // Format hours for easier consumption
            const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            const formattedHours = daysOfWeek.map(day => {
                const key = `hours_${day}`;
                const hourData = storeInfo.hours[key];
                return {
                    day: day.charAt(0).toUpperCase() + day.slice(1),
                    ...hourData
                };
            });

            res.json({
                success: true,
                data: {
                    name: storeInfo.general.store_name || 'PAMBAZO',
                    description: storeInfo.general.store_description || '',
                    slogan: storeInfo.general.store_slogan || '',
                    location: {
                        address: storeInfo.location.store_address || '',
                        city: storeInfo.location.store_city || '',
                        state: storeInfo.location.store_state || '',
                        zip: storeInfo.location.store_zip || '',
                        country: storeInfo.location.store_country || '',
                        coordinates: {
                            lat: parseFloat(storeInfo.location.store_lat || '0'),
                            lng: parseFloat(storeInfo.location.store_lng || '0')
                        },
                        mapsUrl: storeInfo.location.store_maps_url || ''
                    },
                    contact: {
                        phone: storeInfo.contact.contact_phone || '',
                        whatsapp: storeInfo.contact.contact_whatsapp || '',
                        email: storeInfo.contact.contact_email || '',
                        social: {
                            facebook: storeInfo.contact.contact_facebook || '',
                            instagram: storeInfo.contact.contact_instagram || '',
                            twitter: storeInfo.contact.contact_twitter || ''
                        }
                    },
                    hours: formattedHours,
                    delivery: {
                        enabled: storeInfo.general.delivery_enabled === 'true',
                        radiusKm: parseInt(storeInfo.general.delivery_radius_km || '5'),
                        fee: parseInt(storeInfo.general.delivery_fee || '3000'),
                        timeMin: parseInt(storeInfo.general.delivery_time_min || '30'),
                        timeMax: parseInt(storeInfo.general.delivery_time_max || '45')
                    }
                }
            });
        } catch (error: any) {
            logger.error('Error fetching store info:', error);
            res.status(500).json({
                success: false,
                error: {
                    message: 'Error al obtener información de la tienda',
                    details: error.message
                }
            });
        }
    }

    /**
     * Update a setting (admin only)
     */
    static async updateSetting(req: Request, res: Response): Promise<void> {
        try {
            const { key } = req.params;
            const { value } = req.body;

            if (!value) {
                res.status(400).json({
                    success: false,
                    error: { message: 'El valor es requerido' }
                });
                return;
            }

            // Convert value to string (JSON if object)
            const valueStr = typeof value === 'object' ? JSON.stringify(value) : String(value);

            await DatabaseService.run(`
                UPDATE settings
                SET value = ?, updated_at = CURRENT_TIMESTAMP
                WHERE key = ?
            `, [valueStr, key]);

            res.json({
                success: true,
                data: { key, value }
            });
        } catch (error: any) {
            logger.error('Error updating setting:', error);
            res.status(500).json({
                success: false,
                error: {
                    message: 'Error al actualizar configuración',
                    details: error.message
                }
            });
        }
    }
}
