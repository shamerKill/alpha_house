//  唯一数据
class OnlyData {
  idArr: string[];

  constructor() {
    this.idArr = [];
  }

  getOnlyData(): string {
    const id = `only_${Math.random().toFixed(8).substr(2)}`;
    if (this.idArr.find(item => item === id) !== undefined) return this.getOnlyData();
    return id;
  }

  delOnlyData(...ids: string[]): void {
    ids.forEach(id => {
      const index = this.idArr.findIndex(item => item === id);
      this.idArr.splice(index, 1);
    });
  }
}

const onlyData = new OnlyData();

export default onlyData;
