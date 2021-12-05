import {Request, Response} from 'express';
import qs from 'qs';
import {HateoasMode} from './interfaces/HateoasMode';
import {Idable} from './interfaces/Idable';
import {PaginatedResult} from './interfaces/PaginatedResult';
interface Link {
  name: string;
  url: string;
}

export class Hateoas<T extends Idable> {
  links: Link[];

  constructor(
    private req: Request,
    private res: Response,
    private pr: PaginatedResult<T>,
    private mode: HateoasMode
  ) {
    this.links = [];
    const needsNext = pr.length > pr.page * pr.pageSize;
    const needsPrevious = pr.page > 1;

    const endPoint =
      this.req.protocol +
      '://' +
      this.req.get('host') +
      this.req.originalUrl.replace(/\?.*$/, '');
    const query = {...req.query};

    if (needsNext) {
      query.page = (pr.page + 1).toString();
      this.links.push({
        name: 'next',
        url: endPoint + '?' + qs.stringify(query),
      });
      query.page = Math.ceil(pr.length / pr.pageSize).toString();
      this.links.push({
        name: 'last',
        url: endPoint + '?' + qs.stringify(query),
      });
    }
    if (needsPrevious) {
      query.page = (pr.page - 1).toString();
      this.links.push({
        name: 'previous',
        url: endPoint + '?' + qs.stringify(query),
      });
      query.page = '1';
      this.links.push({
        name: 'first',
        url: endPoint + '?' + qs.stringify(query),
      });
    }
  }

  getHeaderLinkValue(): string {
    if (this.links.length === 0) {
      return 'No links.';
    }
    return this.links
      .map(link => `<${link.url}>; rel="${link.name}"`)
      .join(', ');
  }

  json() {
    if (this.mode === 'header') {
      this.res.setHeader('Link', this.getHeaderLinkValue());
      this.res.json(this.pr.array);
      return;
    }
    this.res.json({
      link: this.links,
      array: this.pr.array,
    });
  }
}
