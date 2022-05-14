using System.Text.RegularExpressions;

namespace backend.Services.Parsers
{
    public class Crosswordle2Parser : BasicScoreResultParser
    {
        private ILogger<Crosswordle2Parser> _logger;

        public Crosswordle2Parser(ILogger<Crosswordle2Parser> logger) : base(logger)
        {
            _logger = logger;
        }

        private const string _gameName = "Crosswordle 2";
        public override string GameName => _gameName;
        private readonly Regex _parser = new Regex($"^Crosswordle \\d+ .*? (?<{ScoreGroup}>[\\d]+)/");
        protected override Regex Parser => _parser;
        protected override string? ExtraContent => _url;
        private const string _url = "https://crosswordle.serializer.ca/";
        public override string Url => _url;
    }
}
