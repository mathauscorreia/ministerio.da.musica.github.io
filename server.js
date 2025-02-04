require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const app = express();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Rota principal (renderiza a página com os eventos)
app.get('/', async (req, res) => {
    const { data: eventos, error } = await supabase
        .from('eventos')
        .select('*');

    if (error) {
        console.error('Erro ao buscar eventos:', error);
        return res.status(500).json({ error: 'Erro ao buscar eventos' });
    }

    res.render('index', { eventos });
});

// Rota para retornar os eventos como JSON
app.get('/api/eventos', async (req, res) => {
    const { data: eventos, error } = await supabase
        .from('eventos')
        .select('*');

    if (error) {
        console.error('Erro ao buscar eventos:', error);
        return res.status(500).json({ error: 'Erro ao buscar eventos' });
    }

    // Retorna os eventos em formato JSON
    res.json({ eventos });
});

// Rota para criar evento
app.post('/eventos', async (req, res) => {
    console.log('Recebendo evento:', req.body);
    
    const { data, performer, tipo_evento } = req.body;

    const { data: evento, error } = await supabase
        .from('eventos')
        .insert([{ data, performer, tipo_evento }]);

    if (error) {
        console.error('Erro ao criar evento:', error);
        return res.status(400).json({ error: 'Erro ao criar evento' });
    }

    res.status(201).json({ evento });
});

// Rota para editar evento
app.put('/eventos/:id', async (req, res) => {
    const { id } = req.params;
    const { data, performer, tipo_evento } = req.body;

    const { data: updatedEvent, error } = await supabase
        .from('eventos')
        .update({ data, performer, tipo_evento })
        .eq('id', id);

    if (error) {
        console.error('Erro ao editar evento:', error);
        return res.status(400).json({ error: 'Erro ao editar evento' });
    }

    res.json({ evento: updatedEvent[0] });
});

// Rota para excluir evento
app.delete('/eventos/:id', async (req, res) => {
    const { id } = req.params;

    const { error } = await supabase
        .from('eventos')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Erro ao excluir evento:', error);
        return res.status(400).json({ error: 'Erro ao excluir evento' });
    }

    res.status(200).json({ message: 'Evento excluído com sucesso' });
});

app.listen(process.env.PORT || 3000, () => {
    console.log('Servidor rodando em http://localhost:${process.env.PORT || 3000}');
});
