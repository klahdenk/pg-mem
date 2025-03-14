import { AggregationComputer, AggregationGroupComputer, IValue, nil, QueryError, _ISelection, _IType, _Transaction } from '../../interfaces-private.ts';
import { Expr } from 'https://deno.land/x/pgsql_ast_parser@9.2.1/mod.ts';
import { buildValue } from '../../expression-builder.ts';
import { nullIsh } from '../../utils.ts';
import { DataType } from '../../interfaces.ts';


class MinMax implements AggregationComputer<number> {

    constructor(private exp: IValue, private isMax: boolean) {
    }

    get type(): _IType<any> {
        return this.exp.type;
    }

    createGroup(t: _Transaction): AggregationGroupComputer<number> {
        let val: number | nil = null;
        return {
            feedItem: (item) => {
                const value = this.exp.get(item, t);
                if (!nullIsh(value) && (nullIsh(val) || (
                    this.isMax
                        ? val! < value
                        : val! > value
                ))) {
                    val = value;
                }
            },
            finish: () => val,
        };
    }
}


export function buildMinMax(this: void, base: _ISelection, args: Expr[], op: 'max' | 'min') {
    if (args.length !== 1) {
        throw new QueryError(op.toUpperCase() + ' expects one argument, given ' + args.length);
    }

    const what = buildValue(base, args[0]);

    switch (what.type.primary) {
        case DataType.bigint:
        case DataType.integer:
        case DataType.decimal:
        case DataType.date:
        case DataType.float:
        case DataType.text:
        case DataType.time:
        case DataType.timestamp:
        case DataType.timestamptz:
            break;
        default:
            throw new QueryError(`function min(${what.type.primary}) does not exist`, '42883');
    }
    return new MinMax(what, op === 'max');
}
