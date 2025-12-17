import * as React from 'react';
import { MotionProps } from 'framer-motion';

// 为 framer-motion 的 motion 组件添加 className 属性支持
declare module 'framer-motion' {
  interface MotionDivProps extends MotionProps, React.HTMLAttributes<HTMLDivElement> {
    className?: string;
  }

  interface MotionSpanProps extends MotionProps, React.HTMLAttributes<HTMLSpanElement> {
    className?: string;
  }

  interface MotionButtonProps extends MotionProps, React.HTMLAttributes<HTMLButtonElement> {
    className?: string;
  }

  interface MotionImgProps extends MotionProps, React.HTMLAttributes<HTMLImageElement> {
    className?: string;
  }

  interface MotionSectionProps extends MotionProps, React.HTMLAttributes<HTMLSectionElement> {
    className?: string;
  }

  interface MotionDiv extends React.ForwardRefExoticComponent<MotionDivProps> {}
  interface MotionSpan extends React.ForwardRefExoticComponent<MotionSpanProps> {}
  interface MotionButton extends React.ForwardRefExoticComponent<MotionButtonProps> {}
  interface MotionImg extends React.ForwardRefExoticComponent<MotionImgProps> {}
  interface MotionSection extends React.ForwardRefExoticComponent<MotionSectionProps> {}

  export const motion: {
    div: MotionDiv;
    span: MotionSpan;
    button: MotionButton;
    img: MotionImg;
    section: MotionSection;
    [key: string]: any;
  };
}

// 为 Ornament 组件中使用的 three.js 相关组件添加类型声明
declare module 'framer-motion' {
  interface MotionGroupProps extends MotionProps {
    className?: string;
  }

  export const motion: {
    group: React.ForwardRefExoticComponent<MotionGroupProps>;
    [key: string]: any;
  };
}
