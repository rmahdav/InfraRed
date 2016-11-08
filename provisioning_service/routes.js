module.exports = function(app){
    var keys = require('./controllers/keys');
    var reservations = require('./controllers/reservations');
    var templates = require('./controllers/templates');
    app.post('/users/:UserId/keys', keys.post_keys);
    app.post('/users/:UserId/reservations', reservations.post_reservations);
    app.delete('/users/:UserId/reservations/:ReservationId', reservations.delete_reservation);
    app.get('/users/:UserId/reservations', reservations.get_reservations);
    app.post('/users/:UserId/templates/:TemplateId', templates.post_templates);
    app.post('/users/:UserId/templates/:TemplateId/reservations', templates.post_reservations);
}