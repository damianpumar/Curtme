export class Group<T> {
  key: string;
  members: T[] = [];
  constructor(key: string) {
    this.key = key;
  }
}

export const groupBy = <T>(array: T[], func: (keyToGroup: T) => string) => {
  const result: Group<T>[] = [];
  const getGroupByKey = (key: string) => {
    const index = result.findIndex((group) => group.key === key);

    return result[index];
  };

  array.forEach((element) => {
    let groupKey = func(element);

    const groupItem = getGroupByKey(groupKey);

    if (groupItem) {
      groupItem.members.push(element);
    } else {
      const group = new Group<T>(groupKey);
      group.members.push(element);
      result.push(group);
    }
  });

  return result;
};
