using System.Text.RegularExpressions;

namespace backend.Services.Parsers
{
    public class Crosswordle1Parser : BasicTimeResultParser
    {
        private ILogger<Crosswordle1Parser> _logger;

        public Crosswordle1Parser(ILogger<Crosswordle1Parser> logger) : base(logger)
        {
            _logger = logger;
        }

        private const string _gameName = "Crosswordle 1";
        public override string GameName => _gameName;
        private readonly Regex _parser = new Regex($"$Daily Crosswordle \\d+: (?<{TimeGroup}>\\d*m? ?\\d+s) crosswordle\\.vercel\\.app", RegexOptions.IgnoreCase);
        protected override Regex Parser => _parser;
        private const string _url = "https://crosswordle.vercel.app/";
        public override string Url => _url;
    }
}
