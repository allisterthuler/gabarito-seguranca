import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {

    if(req.method !== "POST"){
        return res.status(405).json({
            erro:"Método não permitido"
        });
    }

    const { senha } = req.body;

    if(senha !== process.env.EXPORT_PASSWORD){
        return res.status(401).json({
            erro:"Senha inválida"
        });
    }

    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE
    );

    const { data, error } = await supabase
        .from('avaliacoes')
        .select('*')
        .order('data_registro', {
            ascending:false
        });

    if(error){
        return res.status(500).json(error);
    }

    return res.status(200).json(data);
}