import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
    vus: 1000, // usuarios virtuales simultáneos
    duration: '30s', // tiempo total de la prueba
};

export default function () {
    // Prueba de login
    let loginRes = http.post('http://localhost:6060/login', JSON.stringify({
        email: 'chris.jara0626@gmail.com',
        password: 'VivaCristioRey1415'
    }), { headers: { 'Content-Type': 'application/json' } });

    check(loginRes, {
        'login status 200': (r) => r.status === 200,
        'login tiene token': (r) => r.json('success') === true
    });

    // Prueba de ofertas
    let offersRes = http.get('http://localhost:6060/api/ofertas');
    check(offersRes, {
        'ofertas status 200': (r) => r.status === 200,
        'ofertas tiene data': (r) => r.json('data') !== undefined
    });

    sleep(1); // espera 1 segundo antes de repetir
}