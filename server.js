const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(express.json());  // Necessário para ler os dados do corpo da requisição

// Configuração do cliente Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Endpoint para listar todos os eventos
app.get('/api/events', async (req, res) => {
  try {
    const { data, error } = await supabase.from('eventos').select('*');
    if (error) {
      console.error('Erro ao buscar eventos:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Erro inesperado:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Endpoint para criar um evento
app.post('/api/events', async (req, res) => {
  const { name, date, type } = req.body;

  if (!name || !date || !type) {
    return res.status(400).json({ success: false, message: 'Faltam dados obrigatórios' });
  }

  const eventDate = new Date(date);
  eventDate.setHours(0, 0, 0, 0);

  try {
    const { data, error } = await supabase
      .from('eventos')
      .insert([{ artista: name, data: eventDate.toISOString(), tipo_evento: type }]);

    if (error) {
      console.error('Erro ao salvar evento:', error);
      return res.status(500).json({ success: false, message: error.message });
    }

    res.status(201).json({ success: true, data });
  } catch (error) {
    console.error('Erro inesperado:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Endpoint para editar um evento
app.put('/api/events/:id', async (req, res) => {
  const { name, date, type } = req.body;
  const eventId = req.params.id;

  if (!name || !date || !type) {
    return res.status(400).json({ success: false, message: 'Faltam dados obrigatórios' });
  }

  const eventDate = new Date(date);
  eventDate.setHours(0, 0, 0, 0);

  try {
    const { data, error } = await supabase
      .from('eventos')
      .update({ artista: name, data: eventDate.toISOString(), tipo_evento: type })
      .match({ id: eventId });

    if (error) {
      console.error('Erro ao editar evento:', error);
      return res.status(500).json({ success: false, message: error.message });
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Erro inesperado:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Endpoint para excluir um evento
app.delete('/api/events/:id', async (req, res) => {
  const eventId = req.params.id;

  try {
    const { data, error } = await supabase
      .from('eventos')
      .delete()
      .match({ id: eventId });

    if (error) {
      console.error('Erro ao excluir evento:', error);
      return res.status(500).json({ success: false, message: error.message });
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Erro inesperado:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
