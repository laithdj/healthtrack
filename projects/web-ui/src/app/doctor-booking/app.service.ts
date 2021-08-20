import { Injectable } from '@angular/core';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';


export class Appointments {
    Id: number;
    Date: string;
    Time: string[];
    Category: string;

}
export class Tooltip {
    isShown: boolean;
    text: string;
}

export class Marker {
    location: any;
    tooltip: Tooltip;
}

const markerUrl = 'https://js.devexpress.com/Demos/RealtorApp/images/map-marker.png';

const markers: Marker[] = [{
    location: [40.755833, -73.986389],
    tooltip: {
        isShown: false,
        text: 'Times Square'
    }
}, {
    location: '40.7825, -73.966111',
    tooltip: {
        isShown: false,
        text: 'Central Park'
    }
}, {
    location: {
        lat: 40.753889,
        lng: -73.981389
    },
    tooltip: {
        isShown: false,
        text: 'Fifth Avenue'
    }
}, {
    location: 'Brooklyn Bridge,New York,NY',
    tooltip: {
        isShown: false,
        text: 'Brooklyn Bridge'
    }
}];

const data: Appointments[] = [{
    'Id': 73,
    'Date': 'Tuesday 28/04/2020',
    'Time': ['8:30 am' , '10:30 am' , '11:30 am', '12:30 pm' , '1:30 pm', '3:30 pm' , '4:30 pm'],
    'Category': ' '
}, {
    'Id': 75,
    'Date': 'Wednesday 29/04/2020',
    'Time': ['10:30 am' , '11:30 am' , '2:30 pm'],
    'Category': ' '
}
];


const dataSource = new DataSource({
    store: new ArrayStore({
        data: data,
        key: 'Id'
    }),
    group: 'Category',
    searchExpr: ['Doctor_Name', 'Occupation']
});


@Injectable()
export class Service {
    apt = false;
    getDataSource() {
        return dataSource;
    }
    getFirstDoctor() {
        return data[0];
    }
    getMarkerUrl(): string {
        return markerUrl;
    }
    getMarkers(): Marker[] {
        return markers;
    }
}
