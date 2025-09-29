</div>
               
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1">
                  Numéro de téléphone
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="58434532"
                />
              </div>
              
               <div>
                 <label className="block text-gray-300 text-sm font-medium mb-1">
                   Rôle