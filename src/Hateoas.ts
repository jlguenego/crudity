import {Request, Response} from 'express';
import {Idable} from './interfaces/Idable';
import {PaginatedResult} from './interfaces/PaginatedResult';
import url from 'url';
interface Link {
  name: string;
  url: string;
}

export class Hateoas<T extends Idable> {
  links: Link[];

  constructor(
    private req: Request,
    private res: Response,
    pr: PaginatedResult<T>
  ) {
    this.links = [];
    // const needsNext = pr.length > pr.page * pr.pageSize;
    // const needsPrevious = pr.page > 1;

    const endPoint = req.protocol + '://' + req.get('host') + req.originalUrl;
    console.log('endPoint: ', endPoint);

    // if (needsNext) {
    //   this.links.push({
    //     name: 'next',
    //     url: endPoint +
    //   });
    // }
  }

  addLink() {
    const val = this.getHeaderLinkValue();
    if (val.length > 0) {
      this.res.setHeader('Link', val);
    }
  }

  getHeaderLinkValue(): string {
    return this.links
      .map(link => `<${link.url}>; rel="${link.name}"`)
      .join(', ');
  }
}
