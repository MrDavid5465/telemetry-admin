import { ComponentType } from 'react';

interface ConditionalProps {
  and?: boolean[];
  or?: boolean[];
  [key: string]: any;
}

export function withConditionalRender<P extends object>(
  WrappedComponent: ComponentType<P>,
): ComponentType<P & ConditionalProps> {
  return function ConditionalComponent(props: P & ConditionalProps) {
    const { and = [true], or = [true], ...rest } = props;
    const allAnd = and.reduce((a, b) => a && b, true);
    const anyOr  = or.reduce((a, b)  => a || b, false);
    return allAnd && anyOr ? <WrappedComponent {...(rest as P)} /> : null;
  };
}

export default withConditionalRender;
