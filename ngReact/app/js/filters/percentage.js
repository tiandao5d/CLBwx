var percentage = function ($filter) {
  "ngInject";

  return function (input, decimals) {
    if (typeof input !== "number") return input;
    if (!$filter("number")(input * 100, decimals)) return input;
    return $filter("number")(input * 100, decimals) + "%";
  };
};

module.exports.name = "percentage";
module.exports.fn = percentage;
