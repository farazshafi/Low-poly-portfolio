import * as THREE from 'three';
import { getHeightAt } from '../world/terrain.js';

/**
 * Master zone list.  To add a new zone: append one entry here — nothing else.
 *
 * Fields:
 *   id          unique string key
 *   label       display name shown in the prompt
 *   x, z        world-space centre (Y is derived from terrain at runtime)
 *   radius      trigger radius in world units
 *   color       hex — used for beacon glow and prompt accent
 *   markerType  'beacon' (more types can be added in markers.js)
 */
const RAW_ZONES = [
    {
        id: 'projects',
        label: 'Projects',
        x: -44,
        z: 20,
        radius: 8,
        color: 0xffaa33,   // warm amber
        markerType: 'beacon',
    },
    {
        id: 'skills',
        label: 'Skills',
        x: 36,
        z: -36,
        radius: 8,
        color: 0x44ccff,   // cool sky blue
        markerType: 'beacon',
    },
    {
        id: 'profile',
        label: 'Profile & Social',
        x: -14,
        z: 13,
        radius: 7,
        color: 0xff55bb,   // rose pink
        markerType: 'beacon',
    },
];

/**
 * Resolved zone definitions — Y snapped to terrain.
 * Imported by ZoneManager and markers.js.
 * @type {Array<{id:string, label:string, position:THREE.Vector3,
 *               radius:number, color:number, markerType:string}>}
 */
export const ZONE_DEFS = RAW_ZONES.map((z) => ({
    id: z.id,
    label: z.label,
    radius: z.radius,
    color: z.color,
    markerType: z.markerType,
    position: new THREE.Vector3(z.x, getHeightAt(z.x, z.z), z.z),
}));
