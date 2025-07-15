const env = process.env.NODE_ENV || 'production';
const local = process.env.NODE_LOCAL || 'docker';
const config = {
    "production": {
        env: "production",
        local,
        port: 4320
    }
};

export default config[env]; 