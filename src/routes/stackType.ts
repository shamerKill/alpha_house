type TypeStackValue = {
  name: string;
  icon: (props: {
    focused: boolean;
    color: string;
    size: number;
  }) => React.ReactNode;
  component: React.ComponentType<any>,
  screens: {
    name: string;
    component: React.ComponentType<any>
  }[];
}[];
export default TypeStackValue;
