var MyNavbarController = function ($rootScope, $scope, $state, AppSettings) {
  "ngInject";
  $scope.title = "抬头的内容";
  console.log(AppSettings);
};

module.exports.fn = MyNavbarController;
module.exports.name = "MyNavbarController";
