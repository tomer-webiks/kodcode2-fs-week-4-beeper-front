import express from 'express';
import { createBeeper, getAllBeepers, getBeeperById, updateBeeper, deleteBeeper, activateBeeper } from '../controllers/beeperController';

export const router = express.Router();

router.post('/beepers', createBeeper);
router.get('/beepers', getAllBeepers);
router.get('/beepers/:id', getBeeperById);
router.put('/beepers/:id', updateBeeper);
router.delete('/beepers/:id', deleteBeeper);
router.post('/beepers/:id/activate', activateBeeper);