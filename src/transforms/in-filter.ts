import { _ISelection, IValue, _IIndex, _ITable, getId } from '../interfaces-private';
import { FilterBase } from './transform-base';
import { DataType, CastError, QueryError } from '../interfaces';

export class InFilter<T = any> extends FilterBase<T> {

    get index() {
        return null;
    }

    get entropy() {
        return this.onValue.index.entropy;
    }

    hasItem(item: T) {
        return this.onValue.index.hasItem(item);
    }

    constructor(private onValue: IValue<T>
        , private elts: any[]) {
        super(onValue.origin);
        if (onValue.index.expressions.length !== 1) {
            throw new Error('Only supports IN with signle expressions index');
        }
        if (!Array.isArray(elts)) {
            throw new QueryError('Cannot iterate element list');
        }
    }

    *enumerate(): Iterable<T> {
        const index = this.onValue.index;
        for (const a of this.elts) {
            for (const item of index.eq([a])) {
                const id = getId(item)
                yield item;
            }
        }
    }
}