import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { supabaseAdmin } from '../config/supabase.js';
import { AppError } from '../utils/AppError.js';

export const invoicesRouter = Router();

invoicesRouter.use(authMiddleware);

invoicesRouter.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('invoices')
      .select('*, clients(name)')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });
    if (error) throw new AppError(500, error.message);
    res.json({ invoices: data });
  } catch (e) {
    next(e);
  }
});

invoicesRouter.post('/', async (req, res, next) => {
  try {
    const { lineItems, ...invoice } = req.body;
    const { data: inv, error } = await supabaseAdmin
      .from('invoices')
      .insert({ ...invoice, user_id: req.user.id })
      .select()
      .single();

    if (error) throw new AppError(400, error.message);

    if (lineItems?.length) {
      await supabaseAdmin.from('invoice_line_items').insert(
        lineItems.map((item, i) => ({
          ...item,
          invoice_id: inv.id,
          sort_order: i,
        }))
      );
    }

    res.status(201).json({ invoice: inv });
  } catch (e) {
    next(e);
  }
});

invoicesRouter.post('/:id/payments', async (req, res, next) => {
  try {
    const { amount, payment_method, reference, notes } = req.body;
    const { data, error } = await supabaseAdmin
      .from('payments')
      .insert({
        user_id: req.user.id,
        invoice_id: req.params.id,
        amount,
        payment_method,
        reference,
        notes,
      })
      .select()
      .single();

    if (error) throw new AppError(400, error.message);

    await supabaseAdmin
      .from('invoices')
      .update({ status: 'paid' })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    res.status(201).json({ payment: data });
  } catch (e) {
    next(e);
  }
});
