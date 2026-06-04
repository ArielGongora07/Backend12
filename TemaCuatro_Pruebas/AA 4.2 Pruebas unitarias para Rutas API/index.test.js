import request from 'supertest';
import { jest } from '@jest/globals'; 

// 1. Funciones espía simuladas
const mockToArray = jest.fn();
const mockInsertOne = jest.fn();
const mockFindOne = jest.fn();

// 2. Simulamos el driver nativo de MongoDB (sin usar require)
jest.unstable_mockModule('mongodb', () => {
    return {
        MongoClient: class {
            connect() { return Promise.resolve({}); }
            db() {
                return {
                    collection: () => ({
                        find: () => ({ toArray: mockToArray }),
                        insertOne: mockInsertOne,
                        findOne: mockFindOne,
                    })
                };
            }
        },
        ObjectId: class {
            constructor(id) { this.id = id; }
            toString() { return this.id; }
        }
    };
});

// 3. Importamos tu app dinámicamente DESPUÉS de simular la base de datos
const { default: app } = await import('./index.js');

describe('Actividad 4.2 - Pruebas Unitarias CRUD (Driver Nativo)', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('1. [GET /usuarios] Debe retornar la lista completa', async () => {
        const listaFalsa = [{ _id: '1', nombre: 'Ariel', edad: 21 }];
        mockToArray.mockResolvedValue(listaFalsa);

        const response = await request(app).get('/usuarios');

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(listaFalsa);
    });

    test('2. [POST /usuarios] Debe registrar un usuario', async () => {
        const nuevoUsuario = { nombre: 'Carlos', edad: 30 };
        const respuestaFalsa = { acknowledged: true, insertedId: 'mocked-id-123' };
        mockInsertOne.mockResolvedValue(respuestaFalsa);

        const response = await request(app).post('/usuarios').send(nuevoUsuario);

        expect(response.statusCode).toBe(201);
        expect(response.body.acknowledged).toBe(true);
    });

    test('3. [GET /usuario/:id] Debe retornar un usuario específico', async () => {
        const usuarioFalso = { _id: 'id-buscado', nombre: 'Ariel', edad: 21 };
        mockFindOne.mockResolvedValue(usuarioFalso);

        const response = await request(app).get('/usuario/id-buscado');

        expect(response.statusCode).toBe(200);
        expect(response.body.nombre).toBe('Ariel');
    });
});