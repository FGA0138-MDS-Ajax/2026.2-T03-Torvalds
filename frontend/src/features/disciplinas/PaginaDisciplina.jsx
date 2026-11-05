import { useState, useEffect } from 'react';
import dadosExemplo from './dadosExemplo.json';

export default function PaginaDisciplina() {
    const id = 1;
    const [entregas, setEntregas] = useState([]);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setEntregas(dadosExemplo);
            setCarregando(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    const formatarData = (dataString) => {
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-BR', { day: '2-digit', month: "2-digit"});
    };

    const estaAtrasado = (prazoString) => {
        const prazo = new Date(prazoString);
        const hoje = new Date();
        return prazo < hoje;
    };

    if(carregando) {
        return <div style={{ padding: '20px' }}>Carregando entregas...</div>;
    }

    if (entregas.length === 0){
        return <div style={{ padding: '20px'}}>Nenhuma entrega encontrada.</div>;
    }

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
            <h1>Cabeçalho da Disciplina {id}</h1>
            <h2>Lista de Entregas</h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
            {entregas.map((entrega) => {
                const atrasada = estaAtrasado(entrega.prazo);
                return (
            <li key={entrega.id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px', borderRadius: '5px', backgroundColor: atrasada ? '#ffe6e6' : '#fff' }}>
                <strong>{entrega.titulo}</strong>
                <p style={{ margin: '5px 0' }}>Tipo: {entrega.tipo} | Prazo: {formatarData(entrega.prazo)}</p>
                <span style={{ color: atrasada ? 'red' : 'green', fontWeight: 'bold' }}>{atrasada ? 'ATRASADA' : 'PENDENTE'}</span>
            </li>
            );
            })}
            </ul>
        </div>
        );
}
