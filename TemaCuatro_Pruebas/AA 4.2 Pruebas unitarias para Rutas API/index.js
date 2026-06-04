import express from 'express';
import dotenv from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb';

// Cargar las variables de entorno
dotenv.config();

const app = express();
const puerto = 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const uri = process.env.MONGO_URI; 

const client = new MongoClient(uri);

let db;
let usuariosCollection;

async function conectarBD() {
    try {
        await client.connect();
        console.log("¡Conexión exitosa a la base de datos con el driver nativo!");
        
        db = client.db('test'); 
        
        usuariosCollection = db.collection('usuarios');
    } catch (error) {
        console.error("Error al conectar a la base de datos:", error);
    }
}


conectarBD();


app.get('/', (req, res) => {
    res.send('Bienvenido a mi API CRUD (Sin Mongoose)');
});

// CREATE: Crear un usuario
app.post('/usuarios', async (req, res) => {
    try {
        // Usamos insertOne con el driver nativo
        const resultado = await usuariosCollection.insertOne(req.body);
        res.status(201).json(resultado);
    } catch (error) {
        console.error("Error al crear el usuario:", error);
        res.status(500).json({ error: 'Error al crear el usuario' });
    }
});

// READ: Obtener todos los usuarios
app.get('/usuarios', async (req, res) => {
    try {
        // Usamos find() y lo convertimos a un arreglo con toArray()
        const usuarios = await usuariosCollection.find().toArray(); 
        res.status(200).json(usuarios);
    } catch (error) {
        console.error("Error al obtener los usuarios:", error);
        res.status(500).json({ error: 'Error al obtener los usuarios' });
    }
});

// READ: Obtener un usuario por su ID
app.get('/usuario/:id', async (req, res) => {
    try {
        const { id } = req.params; 
        // Usamos findOne y convertimos el string a ObjectId
        const usuario = await usuariosCollection.findOne({ _id: new ObjectId(id) }); 
        
        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.status(200).json(usuario); 
    } catch (error) {
        console.error("Error al buscar el usuario:", error);
        res.status(500).json({ error: 'Error al buscar el usuario' });
    }
});

// UPDATE: Actualizar un usuario por su ID
app.put('/usuario/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Usamos updateOne indicando el filtro (_id) y los datos a actualizar ($set)
        const resultado = await usuariosCollection.updateOne(
            { _id: new ObjectId(id) }, 
            { $set: req.body }
        );
        
        if (resultado.matchedCount === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        
        res.status(200).json({ message: 'Usuario actualizado exitosamente' });
    } catch (error) {
        console.error("Error al actualizar el usuario:", error);
        res.status(500).json({ error: 'Error al actualizar el usuario' });
    }
});


app.delete('/usuario/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const resultado = await usuariosCollection.deleteOne({ _id: new ObjectId(id) });
        
        if (resultado.deletedCount === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        
        res.status(200).json({ message: 'Usuario eliminado exitosamente' });
    } catch (error) {
        console.error("Error al eliminar el usuario:", error);
        res.status(500).json({ error: 'Error al eliminar el usuario' });
    }
});

// Al final de tu index.js:
if (process.env.NODE_ENV !== 'test') {
    app.listen(puerto, () => {
        console.log(`Servidor escuchando en http://localhost:${puerto}`);
    });
}

export default app;