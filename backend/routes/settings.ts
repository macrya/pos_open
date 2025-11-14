import { Router, Request, Response } from 'express';
import { SettingsModel } from '../models/Settings';

const router = Router();

// Get all settings
router.get('/', (req: Request, res: Response) => {
  try {
    const settings = SettingsModel.getAll();
    res.json(settings);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific setting
router.get('/:key', (req: Request, res: Response) => {
  try {
    const value = SettingsModel.get(req.params.key);
    if (value === undefined) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    res.json({ key: req.params.key, value });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update single setting
router.put('/:key', (req: Request, res: Response) => {
  try {
    const { value } = req.body;
    if (value === undefined) {
      return res.status(400).json({ error: 'Value is required' });
    }

    SettingsModel.set(req.params.key, value);
    res.json({ key: req.params.key, value });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update multiple settings
router.post('/bulk', (req: Request, res: Response) => {
  try {
    SettingsModel.setMultiple(req.body);
    res.json({ message: 'Settings updated successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Delete setting
router.delete('/:key', (req: Request, res: Response) => {
  try {
    const success = SettingsModel.delete(req.params.key);
    if (!success) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
