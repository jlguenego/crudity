import {Idable} from './Idable';
import {Router} from 'express';
import {CRUDService} from '../CRUDService/CRUDService';

export type CrudityRouter<T extends Idable> = Router & {
  service: CRUDService<T>;
};
