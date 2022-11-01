import React, { Component } from 'react';
import { Table } from '@finos/perspective';
import { ServerRespond } from './DataStreamer';
export interface Row {
  price_abc: number,
  price_def: number,
  ratio: number,
  timestamp: Date,
  upper_bound: number,
  lower_bound: number,
  trigger_alert: number | undefined,
}
import './Graph.css';

export class DataManipulator{
  static generateRow(ServerRespond: ServerRespond[]): Row {
    const priceABC =(ServerRespond[0]. top_ask.price + ServerRespond[0].top_bid.price) / 2;
    const priceDEF =(ServerRespond[1]. top_ask.price + ServerRespond[1].top_bid.price) / 2;
    const ratio = priceABC / priceDEF;
    const upperBound = 1 + 0.5;
    const lowerBound = 1 + 0.5;
    return {
      price_abc: priceABC,
      price_def: priceDEF,
      ratio,
      timestamp: ServerRespond[0] . timestamp > ServerRespond[1].timestamp ?
      ServerRespond[0].timestamp. ServerRespond[1].timestamp,
      upper_bound: upperBound,
      lower_bound: lowerBound,
      trigger_alert: (ratio> upperBound || ratio<lowerBound) ? ratio : undefined,
    };
  }
}
interface PerspectiveViewerElement extends HTMLElement {
  load: (table: Table) => void,
}
class Graph extends Component<IProps, {}> {
  table: Table | undefined;

  render() {
    return React.createElement('perspective-viewer');
  }

  componentDidMount() {
    // Get element from the DOM.
    const elem = document.getElementsByTagName('perspective-viewer')[0] as unknown as PerspectiveViewerElement;

    const schema ={
      price_abc:'float',
      price_def:'float',
      ratio:"float",
      timestamp:'date',
      upper_bound:'float',
      lower_bound:'float',
      trigger_alert:'float',
    };

    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema);
    }
    if (this.table) {
      // Load the `table` in the `<perspective-viewer>` DOM reference.
      elem.load(this.table);
      elem.setAttribute('view', 'y_line');
      elem.setAttribute('column-pivots', '["stock"]');
      elem.setAttribute('row-pivots', '["timestamp"]');
      elem.setAttribute('columns', '["ratio" , "lower_bound" , "upper_bound", "trigger_alert"]');
      elem.setAttribute('aggregates', JSON.stringify({
        price_abc:'avg',
        price_def:'avg',
        ratio:'avg',
        timestamp:'distinct count',
        upper_bound:'avg',
        lower_bound:'avg',
        trigger_alert:'avg',
      })) ;
    }
  }

  componentDidUpdate() {
    if (this.table) {
      this.table.update([
        DataManipulator.generateRow(this.prop.data),
      ]as unknown as TableData);
    }
  }
}

export default Graph;
