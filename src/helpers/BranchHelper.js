export const findUUIDInBranches = (UUID, BRANCHES) => {
  let foundBranch = null;

  BRANCHES.forEach(branch => {
    const { Beacons } = branch;
    Beacons.forEach(beacon => {
      if(beacon.UUID.toUpperCase() == UUID.toUpperCase()) {
        foundBranch = branch;
      }
    });
  })

  return foundBranch;
};
