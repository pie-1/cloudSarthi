const validateIncident = (req, res, next) => {
  const { title, severity, services } = req.body;

  const errors = [];
  
  if (!title) {
    errors.push('Title is required');
  } else if (title.length > 200) {
    errors.push('Title cannot exceed 200 characters');
  }
  
  if (!severity) {
    errors.push('Severity is required');
  } else if (!['critical', 'warning', 'info'].includes(severity)) {
    errors.push('Invalid severity value');
  }
  
  if (!services || !Array.isArray(services) || services.length === 0) {
    errors.push('At least one service is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors
    });
  }

  next();
};

const validateService = (req, res, next) => {
  const { name, type, credentials } = req.body;

  const errors = [];

  if (!name) errors.push('Service name is required');
  if (!type) errors.push('Service type is required');
  if (!credentials || Object.keys(credentials).length === 0) {
    errors.push('Credentials are required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors
    });
  }

  next();
};

const validateUser = (req, res, next) => {
  const { name, email, password } = req.body;

  const errors = [];

  if (!name) errors.push('Name is required');
  if (!email) errors.push('Email is required');
  if (!password) errors.push('Password is required');
  if (password && password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors
    });
  }

  next();
};

module.exports = {
  validateIncident,
  validateService,
  validateUser
};