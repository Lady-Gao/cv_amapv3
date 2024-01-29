

const modulesFiles = import.meta.glob('./*/index.ts', { eager: true });
const componentsArr: { [key: string]: any } = {};

for (const key in modulesFiles) {
  const value = modulesFiles[key];
  componentsArr[value.default.name] = value.default;
}

const install = (app: any) => {
  for (const key in componentsArr) {
    app.component(key, componentsArr[key]);
  }
};

const moduleComponent = {
  version: '0.0.6',
  install,
};

export default moduleComponent;
