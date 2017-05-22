import createBus from 'resolve-bus';
import driverRabbitmq from 'resolve-bus-rabbitmq';

import config from './config';

const busRabbitmq = createBus({ driver: driverRabbitmq({
    url: config.RABBITMQ_CONNECTION_URL
}) });

let eventsLeft = process.argv[2];

busRabbitmq.onEvent(['EVENT_TYPE'], () => {
    if(--eventsLeft === 0) {
        console.log(JSON.stringify({
            memory: process.memoryUsage()
        }));

        process.exit();
    }
});
